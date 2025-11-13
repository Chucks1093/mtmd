import Donation from '@/components/landing-page/Donation';
import FAQSection from '@/components/landing-page/FAQASection';
import Footer from '@/components/landing-page/Footer';
import Header from '@/components/landing-page/Header';
import Hero from '@/components/landing-page/Hero';
import ReportForm from '@/components/landing-page/ReportForm';
import ReportStats from '@/components/landing-page/ReportStats';

function LandingPage() {
	return (
		<div>
			<Header />
			<Hero />
			<ReportStats />
			<ReportForm />
			<Donation />
			<FAQSection />
			<Footer />
		</div>
	);
}
export default LandingPage;
