import { useProfileStore } from '@/hooks/useProfileStore';
import Header from '@/components/dashboard/Header';
import { Outlet, useLoaderData } from 'react-router';
import { useEffect, useState } from 'react';
import SideBar from '@/components/dashboard/SideBar';

function DashboardLayout() {
	//loader data is the data returned from the loader
	const loaderData = useLoaderData();
	const { profile, setProfile } = useProfileStore();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	//Use effect will run anytime the variables in the array changes
	//It also runs when the component function is initalized or run
	useEffect(() => {
		console.log('The loader data is', loaderData);
		setProfile(loaderData);
	}, []);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		profile && (
			<>
				{/* Mobile Layout */}
				<div className="lg:hidden min-h-screen bg-gray-50">
					{/* Mobile overlay */}
					{isSidebarOpen && (
						<div
							className="fixed inset-0 bg-black opacity-60 z-40"
							onClick={closeSidebar}
						/>
					)}

					{/* Mobile Sidebar */}
					<SideBar
						className={`
						fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out
						${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
					`}
						onNavigate={closeSidebar}
					/>

					{/* Mobile Content */}
					<div className="min-h-screen flex flex-col">
						<Header
							className="sticky top-0 z-30 first:max-w-7xl"
							onMenuClick={toggleSidebar}
							showMenuButton={true}
						/>
						<main className="flex-1 bg-[#f8fafe] overflow-auto">
							<Outlet />
						</main>
					</div>
				</div>

				{/* Desktop Layout */}
				<div className="hidden lg:block min-h-screen">
					<div className="min-h-screen grid grid-cols-[256px_1fr] grid-rows-[auto_1fr] h-screen">
						{/* Desktop Sidebar - spans full height */}
						<SideBar className="row-span-2" />

						{/* Desktop Header - spans remaining width */}
						<Header className="col-start-2" showMenuButton={false} />

						{/* Desktop Main content area */}
						<main className="col-start-2 bg-[#f8fafe] overflow-auto">
							<Outlet />
						</main>
					</div>
				</div>
			</>
		)
	);
}

export default DashboardLayout;
