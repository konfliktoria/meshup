import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  UnstyledButton,
  Group,
  ThemeIcon,
  Title,
} from '@mantine/core';
import * as React from 'react';
import { useState } from 'react';
import {
  UserPlus, Affiliate, Stack2, GridDots,
} from 'tabler-icons-react';
import Link from 'next/link';

const navItems = [
  {
    icon: <UserPlus size={16} />, color: 'blue', label: 'Members', path: '/members',
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

export default function Shell({ children }: { children: any }) {
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
      navbar={(
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 180, lg: 180 }}>
          <Navbar.Section grow mt="md">
            {navItems.map((item) => (
              <Link
                href={item.path}
                key={item.label}
              >
                <a
                  href={item.path}
                  onClick={(() => setOpened(false))}
                >
                  <UnstyledButton
                    sx={({
                      display: 'block',
                      width: '100%',
                      padding: theme.spacing.xs,
                      borderRadius: theme.radius.sm,
                      color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

                      '&:hover': {
                        backgroundColor:
                          theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                      },
                    })}
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
        </Navbar>
      )}
      footer={(
        <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
          <Footer height={60} p="md">
            Groupify &mdash; create sensible group matchups
          </Footer>
        </MediaQuery>
      )}
      header={(
        <Header height={70} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Title order={1}>Groupify</Title>
          </div>
        </Header>
      )}
    >
      {children}
    </AppShell>
  );
}