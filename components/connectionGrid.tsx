import { useState } from 'react';
import {
  Table, Center, Button, SegmentedControl,
} from '@mantine/core';
import { Plus, Minus, Icon } from 'tabler-icons-react';
import * as React from 'react';
import styles from './ConnectionGrid.module.scss';
import {
  Member,
} from '../models/team';

interface InteractionMode {
  icon: Icon,
  color: string,
  func: (_: number) => number
}

const Modes: InteractionMode[] = [{
  icon: Plus,
  color: 'green',
  func: (v) => v + 1,
}, {
  icon: Minus,
  color: 'red',
  func: (v) => Math.max(0, v - 1),
}];

interface ConnectionGridProps {
  members: Member[],
  getWeight: (srcIdx: number, trgIdx: number) => number,
  setWeight?: (srcIdx: number, trgIdx: number, update: ((prevWeight: number) => number)) => void
}

export default function ConnectionGrid({ members, getWeight, setWeight }: ConnectionGridProps) {
  const [mode, setMode] = useState<number>(0);

  return (
    <div>
      {members.length > 1 ? (
        <Table
          className={styles.connectionGrid}
          verticalSpacing={4}
          sx={{ '& tbody tr td': { borderBottom: 0 }, width: 'auto' }}
        >
          <thead>
            <tr>
              <th>
                {setWeight !== undefined
                && (
                <Center>
                  <SegmentedControl
                    radius="lg"
                    onChange={(value) => setMode(Number.parseInt(value, 10))}
                    color={Modes[mode].color}
                    data={
                      Modes.map((m, i) => {
                        const ModeIcon = m.icon;
                        return ({
                          label: (
                            <Center>
                              <ModeIcon size={16} />
                            </Center>),
                          value: `${i}`,
                        });
                      })
                    }
                  />
                </Center>
                )}
              </th>
              {members.map((member, index) => (
                <th key={`col-${member.id}`}>
                 <div className={styles.rotationWrapperOuter}>
                    <div className={styles.rotationWrapperInner}>
                      <div className={styles.elementToRotate}> 
                  {member.name}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>    
          </thead>
          <tbody>
            {members.map((rowMember, rowIndex) => (
              <tr key={`row-${rowMember.id}`}>
                <td>
                  {rowMember.name}
                </td>
                {members.map((colMember, colIndex) => {
                  if (rowIndex === colIndex) {
                    return <td key={`${rowMember.id}/${colMember.id}`} />;
                  }
                  return (
                    /* eslint-disable-next-line
                       jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
                    <td
                      key={`${rowMember.id}/${colMember.id}`}
                    >
                      <Button
                        compact
                        fullWidth
                        variant="outline"
                        onClick={setWeight !== undefined
                          ? () => setWeight(rowIndex, colIndex, Modes[mode].func)
                          : undefined}
                      >
                        {getWeight(rowIndex, colIndex)}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : 'More team members required.'}
    </div>
  );
}

ConnectionGrid.defaultProps = {
  setWeight: undefined,
};
