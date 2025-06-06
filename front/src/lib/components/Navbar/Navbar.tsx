import { Link } from 'react-router-dom';

import logo from '@/assets/Logo.png';

import { type Language, useLanguageContext } from '@/i18n';
import { DrawerMenu } from '@/lib/components/Navbar/DrawerMenu';
import { SupervisorNotification } from '@/lib/components/Navbar/SupervisorNotification';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { Trans } from '@lingui/react/macro';
import { Button } from '@mui/material';

export const Navbar = () => {
  const { username } = useLoggedInUser();

  return (
    <>
      <nav className="flex items-center justify-between flex-wrap bg-black-tint-40 shadow p-1 gap-1.5">
        <TaseraLogo />
        {username ? <Username /> : <LogInButton />}
        <div className="flex gap-1">
          <LanguageButton label="SWE" lang="sv" />
          <LanguageButton label="ENG" lang="en" />
          <LanguageButton label="FIN" lang="fi" />
        </div>
        <DrawerMenu />
      </nav>
      <SupervisorNotification />
    </>
  );
};

interface LanguageButtonProps {
  label: string;
  lang: Language;
}

function LanguageButton({ label, lang }: LanguageButtonProps) {
  const [currentLang, setCurrentLang] = useLanguageContext();

  return (
    <Button
      className="bg-black-tint-70! text-white! font-lato! font-bold! text-sm! py-1.5! px-5! rounded-4xl! m-0.5 ml-auto border border-[#484848] shadow data-[is-active='true']:underline!"
      data-is-active={currentLang === lang}
      onClick={() => {
        setCurrentLang(lang);
      }}
    >
      {label}
    </Button>
  );
}

function Username() {
  const { username } = useLoggedInUser();
  return <p className="flex grow justify-end">{username}</p>;
}

function LogInButton() {
  return (
    <Link
      className="bg-black-tint-70 text-white! font-lato! font-bold! text-sm py-1.5! px-5! rounded-4xl m-0.5 ml-auto border border-[#484848] shadow"
      to="/signin"
    >
      <Trans>Sign In</Trans>
    </Link>
  );
}

function TaseraLogo() {
  return (
    <Link className="ml-3" to="/">
      <img
        className="w-[60%] max-w-[300px] min-w-[300px]"
        src={logo}
        alt="Tasera"
      />
    </Link>
  );
}
