import { createContext, useContext, useMemo } from 'react';
import * as React from 'react';
import { showNotification } from '@mantine/notifications';
import { EMPTY_TEAM, Member, Team } from '../models/team';
import { loadFromStorage } from '../utils/persistence';

type TeamContextType = {
    team: Team
    members: Member[]
    setTeam: (team: Team) => void
    partitions: number[]
    setPartitions: (parts: number[]) => void
}

const Context = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: any }) {
  const [partitions, dispatchPartitions] = React.useState<number[]>([]);
  const [team, dispatchTeam] = React.useState<Team>(EMPTY_TEAM);
  const teamContext = useMemo<TeamContextType>(() => ({
    team,
    members: team.members,
    setTeam: (newTeam: Team) => dispatchTeam(newTeam),
    partitions,
    setPartitions: dispatchPartitions,
  }), [team, partitions]);

  React.useEffect(() => {
    const data = loadFromStorage('default');
    if (data != null) {
      const { team: loadedTeam, partitions: loadedPartitions } = data;
      dispatchTeam(loadedTeam);
      dispatchPartitions(loadedPartitions);
      showNotification({
        title: 'Load Successful',
        message: 'Loaded your previous configuration from local browser storage.',
      });
    }
  }, [/* run only once on init */]);

  return (
    <Context.Provider value={teamContext}>
      {children}
    </Context.Provider>
  );
}

export function useTeamContext(): TeamContextType {
  return useContext(Context) as TeamContextType;
}
