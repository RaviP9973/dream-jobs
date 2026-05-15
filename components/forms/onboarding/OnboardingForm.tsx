"use client"
import Image from "next/image";
import Logo from '@/public/logo.svg'
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import UserSelectionForm from "./UserTypeForm";
import { CompanyForm } from "./CompanyForm";
import { JobseekerForm } from "./jobSeekerForm";

type UserSelectionType = 'company' | 'jobseeker' | null;
export default function OnboardingForm() {

    const [step,setStep] = useState(1);
    const [userType, setUserType] = useState<UserSelectionType>(null);

    function handleUserTypeSelection(type: UserSelectionType) {
        setUserType(type);
        setStep(2);
    }

    function renderStep() {
        switch(step) {
            case 1: 
                return <UserSelectionForm onSelect={handleUserTypeSelection}/>;

            case 2: 
                return userType === 'company' ? <CompanyForm /> : <JobseekerForm />;

            default:
                return null;
        }
    }

    

    return (
        <>
            <div className="flex items-center gap-2 mb-10">
                <Image src={Logo} alt="Logo" width={50} height={50}/>
                <h1 className="text-2xl font-bold">Dream<span className="text-primary">Jobs</span></h1>
            </div>

            <Card className="max-w-lg w-full ">
                <CardContent className="p-6">
                    {renderStep()}
                </CardContent>
            </Card>
        </>
    );
}
