import {
  AppShell,
  Navbar,
  Header,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  UnstyledButton,
  Group,
  ThemeIcon,
  Title,
  Divider,
} from '@mantine/core';
import * as React from 'react';
import { useRef, useState } from 'react';
import {
  UserPlus, Affiliate, Stack2, GridDots, DeviceFloppy, Download, Upload, LayoutDashboard, Trash, Share,
} from 'tabler-icons-react';
import Link from 'next/link';
import Importer from './persistence';
import { deleteStorage, exportJSON, saveToStorage } from '../utils/persistence';
import { useTeamContext } from '../providers/team';
import { notifyLoad, notifyDelete } from '../utils/notifications';

const navItems = [
  {
    icon: <LayoutDashboard size={16} />, color: 'blue', label: 'Overview', path: '/',
  },
  {
    icon: <UserPlus size={16} />, color: 'blue', label: 'Members', path: '/members',
  },
  {
    icon: <Share size={16} />, color: 'blue', label: 'Live Poll', path: '/poll',
  },
  {
    icon: <GridDots size={16} />, color: 'blue', label: 'Connections', path: '/connections',
  },
  {
    icon: <Affiliate size={16} />, color: 'blue', label: 'Graph', path: '/graph',
  },
  {
    icon: <Stack2 size={16} />, color: 'blue', label: 'Groups', path: '/groups',
  },
];

function NavbarContent({ hidden, hide }: { hidden: boolean, hide: () => void }) {
  const theme = useMantineTheme();

  const {
    members, setMembers, partitions, setPartitions, getDiagonalMatrix, setDiagonalMatrix,
  } = useTeamContext();
  const openFileRef = useRef<() => void>() as React.MutableRefObject<() => void>;

  const persistenceItems = [
    {
      icon: <Download size={16} />,
      color: 'blue',
      label: 'Export',
      handler: () => exportJSON('default', { team: { members, connectedness: getDiagonalMatrix() }, partitions }),
    },
    {
      icon: <Upload size={16} />,
      color: 'blue',
      label: 'Import',
      handler: () => openFileRef.current(),
    },
    {
      icon: <DeviceFloppy size={16} />,
      color: 'blue',
      label: 'Save',
      handler: () => {
        saveToStorage('default', { team: { members, connectedness: getDiagonalMatrix() }, partitions });
        notifyLoad();
      },
    },
    {
      icon: <Trash size={16} />,
      color: 'blue',
      label: 'Delete',
      handler: () => {
        deleteStorage('default');
        setPartitions([]);
        setMembers([]);
        notifyDelete();
      },
    },
  ];

  const buttonStyle = {
    display: 'block',
    width: '100%',
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  };

  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={hidden} width={{ sm: 180, lg: 180 }}>
      <Navbar.Section mt="md">
        {navItems.map((item) => (
          <Link
            href={item.path}
            key={item.label}
          >
            <a
              href={item.path}
              onClick={hide}
            >
              <UnstyledButton
                sx={buttonStyle}
              >
                <Group>
                  <ThemeIcon color={item.color} variant="light">
                    {item.icon}
                  </ThemeIcon>
                  <Text size="sm">{item.label}</Text>
                </Group>
              </UnstyledButton>
            </a>
          </Link>
        ))}
      </Navbar.Section>
      <Divider style={{ marginTop: '16px' }} />
      <Navbar.Section mt="md">
        {persistenceItems.map((item) => (
          <UnstyledButton
            sx={buttonStyle}
            onClick={item.handler}
            key={item.label}
          >
            <Group>
              <ThemeIcon color={item.color} variant="light">
                {item.icon}
              </ThemeIcon>
              <Text size="sm">{item.label}</Text>
            </Group>
          </UnstyledButton>
        ))}
        <Importer
          setMembers={setMembers}
          setDiagonalMatrix={setDiagonalMatrix}
          setPartitions={setPartitions}
          openFileRef={openFileRef}
        />
      </Navbar.Section>
    </Navbar>
  );
}

export default function Shell({ children, nav }: { children: any, nav: boolean }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      fixed
      navbar={!nav ? undefined : (
        <NavbarContent hidden={!opened} hide={() => setOpened(false)} />
      )}
      header={(
        <Header height={70} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {nav
            && (
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            )}
            <Title order={1}>Mesh:up</Title>
          </div>
        </Header>
      )}
    >
      {children}
    </AppShell>
  );
}
