

import React, { useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/GlassUI';
import { ShieldCheck, FileText, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
    section: 'privacy' | 'terms';
}

const Legal: React.FC<Props> = ({ section }) => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [section]);

    const title = section === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
    const lastUpdated = new Date().toLocaleDateString();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
                <GlassButton onClick={() => navigate('/')} variant="secondary" className="mb-6 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </GlassButton>

                <GlassCard className="p-8 md:p-12 border-t-4 border-t-blue-600">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-8 text-center md:text-left">
                        <div className={`inline-flex p-3 rounded-full mb-4 ${section === 'privacy' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {section === 'privacy' ? <ShieldCheck className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{title}</h1>
                        <p className="text-slate-500">Last Updated: {lastUpdated}</p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {section === 'privacy' ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">1. Data Collection</h3>
                                <p>
                                    We collect minimal data required to operate the result publishing platform. This includes School Name, Admin Email, Student Names, and Academic Marks.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">2. Data Ownership</h3>
                                <p>
                                    The data entered by the school remains the property of the school. SchoolResult Pro acts as a data processor. We do not sell student data to third-party advertisers.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">3. Security</h3>
                                <p>
                                    We use industry-standard encryption to protect your data. However, no internet transmission is 100% secure.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-2">
                                        <AlertTriangle className="w-5 h-5"/> Important Disclaimer
                                    </div>
                                    <p className="text-xs text-red-800 dark:text-red-200">
                                        By using this software, you acknowledge that it is provided "AS IS" without any warranties.
                                    </p>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">1. Service Modifications</h3>
                                <p>
                                    <strong>Right to Modify:</strong> We reserve the right to modify, suspend, or discontinue any part of the service (including free and paid features) at any time, with or without notice. We are not liable to you or any third party for any modification, price change, suspension, or discontinuance of the service.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">2. Limitation of Liability</h3>
                                <p>
                                    To the maximum extent permitted by law, SchoolResult Pro and its creators shall <strong>not be liable</strong> for any direct, indirect, incidental, special, or consequential damages resulting from:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>The use or inability to use the service.</li>
                                        <li>Loss of data, profits, or goodwill.</li>
                                        <li>Unauthorized access to or alteration of your transmissions or data.</li>
                                        <li>Errors or inaccuracies in the results published.</li>
                                    </ul>
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">3. User Responsibilities</h3>
                                <p>
                                    Schools are solely responsible for the accuracy of the academic data they publish. You agree to indemnify SchoolResult Pro against any claims arising from incorrect data or misuse of the platform.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">4. Termination</h3>
                                <p>
                                    We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                                
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">5. Updates to Terms</h3>
                                <p>
                                    We may revise these Terms at any time. By continuing to use the service after those changes become effective, you agree to be bound by the revised terms.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-6 mb-2">6. Refund Policy</h3>
                                <p>
                                    <strong>No Refunds:</strong> All payments made for subscription plans (Smart Campus, Institute Pro) are non-refundable. Since our service offers immediate access to digital features, we do not offer refunds once a payment is processed.
                                </p>
                                <p>
                                    If you believe a billing error has occurred, please contact support immediately.
                                </p>
                            </>
                        )}

                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">Contact Us</h3>
                            <a href="mailto:niyasedavachal@gmail.com" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline mt-2">
                                <Mail className="w-4 h-4" /> niyasedavachal@gmail.com
                            </a>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Legal;
