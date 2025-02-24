
import { Link } from 'react-router-dom';

import logo from '@/assets/Logo.png';
import translations from '../../../texts/texts.json';

import { DrawerMenu } from '@/lib/components/Navbar/DrawerMenu';
import { useLoggedInUser } from '@/lib/hooks/useLoggedInUser';
import { Button } from '@mui/material';
import { SupervisorNotification } from '@/lib/components/Navbar/SupervisorNotification';


const { nav } = translations;

export const Navbar = () => {

  const { username, role } = useLoggedInUser();

  return (
    <>
      <nav className='flex items-center justify-between flex-wrap bg-black-tint-40 shadow p-1 gap-1.5'>
        <TaseraLogo />
        {username ? <Username /> : <LogInButton />}
        <div className="flex gap-1">
          <LanguageButton label="SWE" num={2} />
          <LanguageButton label="ENG" num={1} />
          <LanguageButton label="FIN" num={0} />
        </div>
        <DrawerMenu />
      </nav>
      <SupervisorNotification />
    </>
  );
};

interface LanguageButtonProps {
  label: string;
  num: number;
}

function LanguageButton({ label, num }: LanguageButtonProps) {
  return (
    <Button
      className="bg-black-tint-70! text-white! font-lato! font-bold! text-sm! py-1.5! px-5! rounded-4xl! m-0.5 ml-auto border border-[#484848] shadow"
      onClick={() => {
        localStorage.setItem('language', num.toString());
        window.location.reload();
      }}
    >
      {label}
    </Button>
  )

}

function Username() {
  const { username } = useLoggedInUser();
  return (
    <p className="flex grow justify-end">{username}</p>
  )
}

function LogInButton() {
  const lang = localStorage.getItem('language');

  return (
    <Link
      className="bg-black-tint-70 text-white! font-lato! font-bold! text-sm py-1.5! px-5! rounded-4xl m-0.5 ml-auto border border-[#484848] shadow"
      to="/signin"
    >
      {nav.SignIn[lang]}
    </Link>
  )
}


function TaseraLogo() {
  return (
    <Link
      className="ml-3"
      to="/"
    >
      <img 
        className="w-[60%] max-w-[300px] min-w-[300px]"
        src={logo}
        alt="Tasera"
      />
    </Link>
  )
}
