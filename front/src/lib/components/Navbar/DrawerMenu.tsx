import { ComponentProps, forwardRef, useCallback, useMemo, useState } from 'react';

// Material UI elements
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';

import FeedbackWindow from './FeedbackWindow';
import translations from '../../../texts/texts.json';
// enables overriding material-ui component styles in scss
import { Role, useLoggedInUser } from '@/lib/hooks/useLoggedInUser';


const { nav } = translations;

interface NavItem {
  to: string;
  label: string[]; // translations
} 

const MENU_CONTENT: Record<Role, NavItem[]> = {
  superuser: [
    { to: '/scheduling', label: nav.Schedule },
    { to: '/usermanagement', label: nav.UserManagement },
    { to: '/tracks', label: nav.trackCRUD },
    { to: '/tablet', label: nav.Tablet },
    { to: '/email-settings', label: nav.EmailSettings },
    { to: '/statistics', label: nav.Statistics },
    { to: '/supervisor-raffle', label: nav.Raffle },
    { to: '/info', label: nav.Info },
  ],
  association: [
    { to: '/profile/supervisions', label: nav.Supervision },
    { to: '/profile', label: nav.AssociationProfile },
  ],
  rangeofficer: [
    { to: '/profile/supervisions', label: nav.Supervision },
    { to: '/profile', label: nav.RangeofficerProfile },
  ],
  rangemaster: [
    { to: '/profile/supervisions', label: nav.Supervision },
    { to: '/tablet', label: nav.Tablet }
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
        {nav.Menu[lang]}
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
              {label[lang]}
            </DrawerLink>
          ))}
          {role !== "superuser" && <FeedbackButton />}
          <Divider />
          <DrawerLink to="/" onClick={logout}>
            {nav.SignOut[lang]}
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
        {nav.Feedback[lang]}
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
