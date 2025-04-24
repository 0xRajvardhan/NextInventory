import SideNav from '@/app/ui/dashboard/sidenav';
import Avatar from  '@/app/ui/dashboard/avatar';
import Header from '../ui/dashboard/header';
import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
 
export default async function Layout({ children }: { children: React.ReactNode }) {

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden"> 
      <div className="w-full flex-none md:w-64">
        {/* <Avatar /> */}
        <SideNav />
      </div>
      <div className="flex flex-col w-full">
        <Header/>
        <div className="flex-grow pr-6 pl-6 pb-6 md:overflow-y-auto md:pr-12 md:pl-12 md:pb-12">{children}</div>   
      </div>
    </div>
  );
}

