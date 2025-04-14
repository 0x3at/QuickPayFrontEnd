import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader({
	title,
	actions,
}: {
	title: string;
	actions?: React.ReactNode;
}) {
	return (
		<header className='flex h-12 shrink-0 items-center gap-2 mx-4 my-2 mb-6 rounded-md border border-border shadow-lg bg-card transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
			<div className='flex w-full items-center gap-4 px-4 lg:gap-2 lg:px-6'>
				<SidebarTrigger />
				<Separator
					orientation='vertical'
					className='h-full w-1 bg-foreground'
				/>
				<h1 className='text-base font-semibold'>{title}</h1>
			</div>
			<div className='flex justify-end gap-4 mx-4'>
				{actions}
				<ThemeToggle />
			</div>
		</header>
	);
}
