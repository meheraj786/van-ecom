"use client";
import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
	return (
		<div className="max-w-4xl px-10 py-12 space-y-12">
			<header>
				<h1 className="text-4xl font-serif text-gray-900">Account Settings</h1>
				<p className="text-gray-500 mt-2 font-medium">
					Manage your personal details, security settings, and communication
					preferences.
				</p>
			</header>

			{/* Personal Info Card */}
			<section className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
				<div className="p-8 border-b border-gray-50 bg-[#fcfcfc] flex items-center gap-3">
					<User size={18} className="text-[var(--primary)]" />
					<h3 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">
						Personal Information
					</h3>
				</div>
				<div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
					<Field>
						<FieldLabel className="text-[10px] uppercase tracking-widest font-black text-gray-400">
							Full Name
						</FieldLabel>
						<Input placeholder="Alex Rivera" className="h-12 rounded-xl" />
					</Field>
					<Field>
						<FieldLabel className="text-[10px] uppercase tracking-widest font-black text-gray-400">
							Email Address
						</FieldLabel>
						<Input
							placeholder="alex.rivera@luxe.com"
							className="h-12 rounded-xl"
						/>
					</Field>
				</div>
			</section>

			{/* Security Card */}
			<section className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
				<div className="p-8 border-b border-gray-50 bg-[#fcfcfc] flex items-center gap-3">
					<Shield size={18} className="text-[var(--primary)]" />
					<h3 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">
						Security
					</h3>
				</div>
				<div className="p-8 space-y-8">
					<div className="flex justify-between items-center">
						<div>
							<p className="font-bold text-gray-900">Password</p>
							<p className="text-xs text-gray-400 mt-1">
								Last changed 3 months ago
							</p>
						</div>
						<Button
							variant="outline"
							className="rounded-xl font-bold h-10 px-6"
						>
							Change Password
						</Button>
					</div>
					<div className="flex justify-between items-center pt-8 border-t border-gray-50">
						<div>
							<p className="font-bold text-gray-900">
								Two-Factor Authentication
							</p>
							<p className="text-xs text-gray-400 mt-1">
								Add an extra layer of security.
							</p>
						</div>
						<Switch className="data-[state=checked]:bg-[var(--primary)]" />
					</div>
				</div>
			</section>

			<div className="flex justify-end gap-4 pt-6">
				<button
					type="button"
					className="text-sm font-bold text-gray-400 hover:text-gray-900"
				>
					Discard Changes
				</button>
				<Button
					size="lg"
					className="h-14 px-10 rounded-2xl font-bold shadow-xl"
				>
					Save Settings
				</Button>
			</div>
		</div>
	);
};

export default SettingsPage;
