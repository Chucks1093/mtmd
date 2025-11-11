import Donation from '@/components/landing-page/Donation';
import Footer from '@/components/landing-page/Footer';
import Header from '@/components/landing-page/Header';
import ReportForm from '@/components/landing-page/ReportForm';
function LandingPage() {
	return (
		<div>
			<Header />
			<ReportForm />
			<Donation />
			<Footer />
		</div>
	);
}
export default LandingPage;
