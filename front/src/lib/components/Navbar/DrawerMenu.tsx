import { ComponentProps, forwardRef, useCallback, useMemo, useState } from 'react';

// Material UI elements
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';

import FeedbackWindow from './FeedbackWindow';
// enables overriding material-ui component styles in scss
import { Role, useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { t, msg } from '@lingui/core/macro';
import { MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';


interface NavItem {
  to: string;
  label: MessageDescriptor;
} 

const MENU_CONTENT: Record<Role, NavItem[]> = {
  superuser: [
    { to: '/scheduling', label: msg`Schedules` },
    { to: '/usermanagement', label: msg`User management` },
    { to: '/tracks', label: msg`Edit tracks` },
    { to: '/tablet', label: msg`Tablet view` },
    { to: '/email-settings', label: msg`Email settings` },
    { to: '/statistics', label: msg`Statistics` },
    { to: '/supervisor-raffle', label: msg`Supervisor raffle` },
    { to: '/info', label: msg`Add info message` },
  ],
  association: [
    { to: '/profile/supervisions', label: msg`Supervisions` },
    { to: '/profile', label: msg`Association dashboard` },
  ],
  rangeofficer: [
    { to: '/profile/supervisions', label: msg`Supervisions` },
    { to: '/profile', label: msg`Account dashboard` },
  ],
  rangemaster: [
    { to: '/profile/supervisions', label: msg`Supervisions` },
    { to: '/tablet', label: msg`Tablet view` }
  ],
}


export function DrawerMenu() {
  const lang = localStorage.getItem('language');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { isLoggedIn, role, logout } = useLoggedInUser()

  const toggleDrawer = useCallback((drawerOpen) => {
    setIsDrawerOpen(drawerOpen);
  }, [isDrawerOpen]);


  const navItems = useMemo(() => {
    return MENU_CONTENT[role] || [];
  }, [role]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div>
      <Button
        className="bg-black-tint-70! text-white! font-lato! font-bold! text-sm! py-1.5! px-5! rounded-4xl! m-0.5 ml-auto border border-[#484848] shadow"
        onClick={() => setIsDrawerOpen(true)}
      >
        {t`Menu`}
      </Button>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        classes={{ paper: "bg-black-tint-10" }}
      >
        <div className="flex flex-col gap-2 p-2">
          {navItems.map(({ to, label }) => (
            <DrawerLink to={to} key={label[lang]} onClick={() => setIsDrawerOpen(false)}>
              <Trans {...label} />
            </DrawerLink>
          ))}
          {role !== "superuser" && <FeedbackButton />}
          <Divider />
          <DrawerLink to="/" onClick={logout}>
            {t`Sign Out`}
          </DrawerLink>
        </div>
      </Drawer>
    </div>
  );
};

function FeedbackButton() {
  const lang = localStorage.getItem('language');
  const [open, setOpen] = useState(false);
  return (
    <>
      <DrawerButton
        onClick={() => setOpen(true)}
      >
        {t`Feedback`}
      </DrawerButton>
      <FeedbackWindow
        dialogOpen={open}
        onCloseDialog={() => setOpen(false)}
      />
    </>
  )
}


type LinkProps = ComponentProps<typeof Link>;

function DrawerLink({children, ...props}: LinkProps) {
  return (
    <Link
      {...props}
      className="text-left w-full py-1 px-4 hover:bg-[#dcdcdc]"
      >
      {children}
    </Link>
  );
}

const DrawerButton = forwardRef<HTMLButtonElement, ComponentProps<"button">>(({children, ...props}, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="text-left w-full py-1 px-4 hover:bg-[#dcdcdc]"
    >
      {children}
    </button>
  );
})
