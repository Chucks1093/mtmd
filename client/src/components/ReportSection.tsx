import React from 'react';
import ReportForm from './ReportForm';

export const ReportSection: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="container mx-auto px-4">
				{/* Demo Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
						✅ MVP Demo Ready
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						National Toilet Campaign Platform
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Empowering Nigerian citizens to report toilet conditions and
						help improve sanitation infrastructure nationwide
					</p>
				</div>

				{/* Features Overview */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							📍
						</div>
						<h3 className="text-lg font-semibold mb-2">
							Location Tracking
						</h3>
						<p className="text-gray-600 text-sm">
							Cascading State → LGA → Ward selection using real Nigerian
							administrative data
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							✅
						</div>
						<h3 className="text-lg font-semibold mb-2">
							Smart Validation
						</h3>
						<p className="text-gray-600 text-sm">
							Real-time form validation with Zod schema and proper error
							handling
						</p>
					</div>

					<div className="bg-white p-6 rounded-lg shadow-sm text-center">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
							🚀
						</div>
						<h3 className="text-lg font-semibold mb-2">API Ready</h3>
						<p className="text-gray-600 text-sm">
							Complete backend integration with report service and
							database storage
						</p>
					</div>
				</div>

				{/* Form Section */}
				<ReportForm />

				{/* Demo Footer */}
				<div className="text-center mt-12 pb-8">
					<div className="inline-flex items-center space-x-4 text-sm text-gray-500">
						<span>🔧 Built with TypeScript + React + Zod</span>
						<span>•</span>
						<span>💾 Backend API Integration Ready</span>
						<span>•</span>
						<span>📱 Fully Responsive Design</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ReportSection;
