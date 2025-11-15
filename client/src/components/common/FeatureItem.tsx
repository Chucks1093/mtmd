import { type LucideIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureItemProps {
	icon?: LucideIcon;
	title: string;
	description: string;
	iconColor?: string;
	iconBgColor?: string;
	className?: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
	icon: Icon = TrendingUp,
	title,
	description,
	iconColor = 'text-blue-600',
	iconBgColor = 'bg-blue-50',
	className,
	...props
}) => {
	return (
		<motion.div
			className={cn(
				'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group ',
				className
			)}
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			{...props}
		>
			<motion.div
				className={cn(
					'flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full group-hover:scale-110 transition-transform duration-300',
					iconBgColor
				)}
				whileHover={{ rotate: 5 }}
				transition={{ duration: 0.3 }}
			>
				<Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)} />
			</motion.div>

			<div className="flex-1 hidden md:block">
				<motion.h3
					className="font-bold text-gray-800 group-hover:text-gray-700 transition-colors duration-300 text-xs sm:text-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					{title}
				</motion.h3>
				<motion.p
					className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					{description}
				</motion.p>
			</div>
		</motion.div>
	);
};

export default FeatureItem;
