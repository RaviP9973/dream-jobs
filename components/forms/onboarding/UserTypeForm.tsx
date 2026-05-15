import { Button } from "@/components/ui/button";
import { Building2, UserRound } from "lucide-react";

type UserSelectionType = 'company' | 'jobseeker';

interface UserTypeFormProps {
  onSelect: (type: UserSelectionType) => void;
}

export default function UserSelectionForm({onSelect}: UserTypeFormProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold ">Welcome! Lets get started</h2>
        <p className="text-muted-foreground">Choose how you would like to use our platform!</p>
      </div>

      <div className="grid gap-4 ">
        <Button 
        onClick={() => onSelect("company")}
        variant={"outline"}  className="w-full h-auto p-6 items-center gap-4 border-2  transition-all duration-200 hover:!border-primary hover:!bg-primary/5">
            <div className="size-12 rounded-full bg-primary/10  flex items-center justify-center">

            <Building2 className="size-6  text-primary" />
            </div>
            <div className="text-left ">
            <h3 className="font-semibold  text-lg">Company/Organisation</h3>
            <p>Post Jobs and find exceptional talent</p>

        </div>
        </Button>
        <Button 
        onClick={() => onSelect("jobseeker")}
        variant={"outline"}  className="w-full h-auto p-6 items-center gap-4 border-2  transition-all duration-200 hover:!border-primary hover:!bg-primary/5">
            <div className="size-12 rounded-full bg-primary/10  flex items-center justify-center">

            <UserRound className="size-6  text-primary" />
            </div>
            <div className="text-left ">
            <h3 className="font-semibold  text-lg">Job Seeker</h3>
            <p>Find your dream jobs opportunity</p>

        </div>
        </Button>

        
      </div>
    </div>
  );
}
