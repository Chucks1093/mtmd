import React, { useState } from 'react';
import {
	ChevronDown,
	ChevronUp,
	HelpCircle,
	Mail,
	Phone,
	Heart,
	Flag,
	Settings,
	Info,
} from 'lucide-react';

interface FAQItem {
	id: string;
	question: string;
	answer: string;
	category: 'donation' | 'campaign' | 'technical' | 'general';
}

const faqData: FAQItem[] = [
	{
		id: '1',
		question: 'What is the National Toilet Campaign?',
		answer:
			'The National Toilet Campaign is a civic engagement initiative focused on improving sanitation infrastructure across Nigeria. We enable citizens to report toilet conditions through photo uploads while providing government agencies and stakeholders with valuable data-driven insights.',
		category: 'campaign',
	},
	{
		id: '2',
		question: 'How are donations used?',
		answer:
			'100% of donations go directly to sanitation improvements. Your contributions fund toilet facility construction, maintenance of existing facilities, awareness campaigns, and emergency sanitation responses across Nigerian communities.',
		category: 'donation',
	},
	{
		id: '3',
		question: 'Is my donation secure?',
		answer:
			'Yes, absolutely. All donations are processed securely through Paystack, a trusted payment gateway. We never store your payment information, and all transactions are encrypted and protected.',
		category: 'donation',
	},
	{
		id: '4',
		question: 'How can I submit a toilet report?',
		answer:
			'Simply use our reporting form on the homepage. Take a photo of the toilet facility, provide the location details (State, LGA, specific address), and submit. Our team reviews all submissions to ensure data quality.',
		category: 'campaign',
	},
	{
		id: '5',
		question: 'Can I track the impact of my donation?',
		answer:
			'Yes! We provide regular updates on our progress through public reports. You can see how your donations contribute to improved sanitation facilities and view statistics on our interactive map.',
		category: 'donation',
	},
	{
		id: '6',
		question: 'What types of toilet facilities can I report?',
		answer:
			'You can report any type of toilet facility including public toilets, school facilities, hospital restrooms, market facilities, office buildings, and residential facilities. We accept reports on all sanitation infrastructure.',
		category: 'campaign',
	},
	{
		id: '7',
		question: 'Can I make recurring donations?',
		answer:
			'Yes! You can set up monthly or annual recurring donations to provide ongoing support for sanitation improvements. Recurring donors help us plan and implement long-term projects more effectively.',
		category: 'donation',
	},
	{
		id: '8',
		question: 'What happens to my personal information?',
		answer:
			'We take privacy seriously. Your personal information is used only for donation processing and campaign updates. We never share your data with third parties, and you can opt out of communications at any time.',
		category: 'technical',
	},
	{
		id: '9',
		question: 'How do I get updates on the campaign?',
		answer:
			'When you donate or submit a report, you can opt-in to receive email updates about campaign progress, impact stories, and new initiatives. You can also follow our progress through the public statistics on our website.',
		category: 'general',
	},
	{
		id: '10',
		question: 'Can organizations partner with the campaign?',
		answer:
			'Absolutely! We welcome partnerships with NGOs, government agencies, corporations, and community organizations. Contact us to discuss how your organization can support or collaborate with our sanitation improvement efforts.',
		category: 'general',
	},
];

const categoryConfig = {
	donation: {
		color: 'bg-pink-100 text-pink-700 border-pink-200',
		icon: Heart,
		label: 'Donation',
	},
	campaign: {
		color: 'bg-green-100 text-green-700 border-green-200',
		icon: Flag,
		label: 'Campaign',
	},
	technical: {
		color: 'bg-blue-100 text-blue-700 border-blue-200',
		icon: Settings,
		label: 'Technical',
	},
	general: {
		color: 'bg-purple-100 text-purple-700 border-purple-200',
		icon: Info,
		label: 'General',
	},
};

const FAQSection: React.FC = () => {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
	const [activeCategory] = useState<string>('all');

	const toggleItem = (id: string) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedItems(newExpanded);
	};

	const filteredFAQs =
		activeCategory === 'all'
			? faqData
			: faqData.filter(faq => faq.category === activeCategory);

	return (
		<section className="py-16 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-full text-sm font-medium">
						<HelpCircle className="w-4 h-4" />
						Frequently Asked Questions
					</div>
					<h1 className="text-gray-600 tracking-tight font-space-grotesk text-[1.8rem] md:text-[3rem] font-semibold mt-3 text-center">
						Got Questions? We've Got Answers
					</h1>
					<p className="text-md text-gray-600 max-w-2xl mx-auto md:text-lg">
						Find answers to common questions about donations, reporting,
						and our mission to improve sanitation across Nigeria.
					</p>
				</div>

				<div className="grid lg:grid-cols-1 gap-12 items-start max-w-2xl mx-auto">
					{/* Left Side - Illustration */}
					<div className="relative hidden order-2 lg:order-1">
						{/* FAQ Illustration */}
						<div className="relative">
							{/* Background decoration */}
							<div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl transform rotate-3 opacity-50"></div>
							<div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-3xl transform -rotate-2 opacity-30"></div>

							{/* Main illustration container */}
							<div className="relative bg-white rounded-2xl p-8 shadow-xl">
								{/* Custom FAQ Illustration */}
								<div className="text-center">
									<div className="mb-6">
										{/* Question mark icon with decorations */}
										<div className="relative inline-block">
											<div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
												<HelpCircle className="w-12 h-12 text-white" />
											</div>
											{/* Floating question marks */}
											<div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
												<span className="text-xs font-bold text-gray-800">
													?
												</span>
											</div>
											<div className="absolute -bottom-1 -left-3 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
												<span className="text-xs font-bold text-white">
													?
												</span>
											</div>
										</div>
									</div>

									<h3 className="text-2xl font-bold text-gray-900 mb-4">
										Need Help?
									</h3>
									<p className="text-gray-600 mb-6">
										We've compiled the most common questions about our
										campaign. Can't find what you're looking for?
									</p>

									{/* Contact options */}
									<div className="space-y-3">
										<div className="flex items-center justify-center gap-3 p-3 bg-blue-50 rounded-lg">
											<Mail className="w-5 h-5 text-blue-600" />
											<span className="text-sm text-gray-700">
												support@toiletcampaign.ng
											</span>
										</div>
										<div className="flex items-center justify-center gap-3 p-3 bg-green-50 rounded-lg">
											<Phone className="w-5 h-5 text-green-600" />
											<span className="text-sm text-gray-700">
												+234 123 456 7890
											</span>
										</div>
									</div>
								</div>

								{/* Floating elements */}
								<div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
								<div className="absolute bottom-6 left-4 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></div>
								<div className="absolute top-1/2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
							</div>
						</div>
					</div>

					{/* Right Side - FAQ Items */}
					<div className="order-1 ">
						<div className="space-y-4">
							{filteredFAQs.map(faq => {
								const isExpanded = expandedItems.has(faq.id);
								const config = categoryConfig[faq.category];

								return (
									<div
										key={faq.id}
										className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
									>
										<button
											onClick={() => toggleItem(faq.id)}
											className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl"
										>
											<div className="flex items-center justify-between gap-4">
												{/* Question */}
												<h3 className="text-lg font-medium text-gray-800 font-grotesque">
													{faq.question}
												</h3>

												{/* Expand/Collapse Icon */}
												<div className="flex  gap-3 mt-2">
													<div className="flex items-center gap-2 ">
														<div
															className={`
																inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-gray-100
																text-gray-600
															`}
														>
															{config.label}
														</div>
													</div>
													<div
														className={`
														w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100 text-gray-400 hover:bg-gray-200
														
													`}
													>
														{isExpanded ? (
															<ChevronUp className="w-4 h-4" />
														) : (
															<ChevronDown className="w-4 h-4" />
														)}
													</div>
												</div>
											</div>
										</button>

										{/* Answer */}
										{isExpanded && (
											<div className="px-6 pb-5">
												<div className="border-t border-gray-100 pt-4 ">
													<p className="text-gray-600 leading-relaxed">
														{faq.answer}
													</p>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FAQSection;
