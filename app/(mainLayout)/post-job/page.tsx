import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/requireUser";
import { CreateJobForm } from "@/components/forms/CreateJobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ArcjetLogo from "@/public/arcjet.svg";
import InngestLogo from "@/public/inggest.png";
import Image from "next/image";
import { redirect } from "next/navigation";

const companies = [
  { id: 0, name: "Arcjet", logo: ArcjetLogo },
  { id: 1, name: "Inngest", logo: InngestLogo },
  { id: 2, name: "Arcjet", logo: ArcjetLogo },
  { id: 3, name: "Inngest", logo: InngestLogo },
  { id: 4, name: "Arcjet", logo: ArcjetLogo },
  { id: 5, name: "Inngest", logo: InngestLogo },
];


const testimonials = [
    {
        quote: "Finding the right opportunity has never been this smooth. The matching system is spot on!",
        author: "Sarah chen",
        company: "TechCorp"
    },
    {
        quote: "Finding the right opportunity has never been this smooth. The matching system is spot on!",
        author: "Sarah chen",
        company: "TechCorp"
    },
    {
        quote: "The platform's intuitive design made posting a job a breeze.",
        author: "John Doe",
        company: "Innovatech"
    },
    {
        quote: "I was impressed by the quality of candidates I received.",
        author: "Jane Smith",
        company: "Creative Solutions"
    }
]

const stats = [
    {
        id: 0, value: "10K+", label: "Monthly active job seekers"
    },
    {
        id: 1, value: "48h", label: "Average time to hire"
    },
    {
        id: 2, value: "95%", label: "Job match success rate"
    },
    {
        id: 3, value: "500+", label: "Companies hiring remotely"
    }

]


async function getCompany(userId: string) {
  const data = await prisma.company.findUnique({
    where: {
      userId: userId
    },
    select: {
      name: true,
      about: true,
      logo: true,
      xAccount: true,
      website: true,
    }
  });

  if(!data) {
    return redirect("/");
  }
  return data;
}

export default async function PostJobPage() {

  const session = await requireUser();
  const data = await getCompany(session.id as string);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
      <CreateJobForm companyAbout={data?.about} companyName={data?.name} companyWebsite={data?.website} companyXAccount={data?.xAccount} companyLogo={data?.logo} />

      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Trusted by Industry Leaders
            </CardTitle>
            <CardDescription>
              Join thousands of companies in finding the right talent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* company logos */}
            <div className="grid grid-cols-3 gap-4">
              {companies.map((company) => (
                <div key={company?.id}>
                  <Image src={company.logo} alt={company.name} height={80} width={80} className="rounded-lg opacity-75 transition-opacity hover:opacity-100" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {
                testimonials.map((testimonial,index) => (
                    <blockquote className="border-l-2 border-primary pl-4" key={index}>
                        <p className="text-sm text-muted-foreground italic">"{testimonial.quote}"</p>
                        <footer className="mt-2 text-sm font-medium">
                            - {testimonial.author}, <span className="font-semibold">{testimonial.company}</span>
                        </footer>
                    </blockquote>
                ))
              }
            </div>

            {/* we will render stats here */}

            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                    <div key={stat?.id} className="rounded-lg bg-muted p-4">
                        <h4 className="text-2xl font-bold ">
                            {stat?.value}
                        </h4>
                        <p className="text-sm text-muted-foreground">{stat?.label}</p>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
