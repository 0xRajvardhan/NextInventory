import AvatarComponent from './avatar'; // Import your Avatar component
import LocaleSwitcher from "../components/LocaleSwitcher";

export default function Header() {

  return (
    <header>
      <div className="flex w-full items-center p-4 justify-end rounded-md">
        <LocaleSwitcher />
        <AvatarComponent />
      </div>
    </header>
  );
}
