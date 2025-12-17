"use client";

import { createJob, editJobPost } from "@/app/actions";
import { countryList } from "@/app/utils/countryList";
import { jobSchema } from "@/app/utils/zodSchemas";
import { BenefitsSelector } from "@/components/general/BenefitsSelector";
import { SalaryRangeSelector } from "@/components/general/SalaryRangeSelector";
import { UploadDropzone } from "@/components/general/UploadThingReexported";
import { JobDescriptionEditor } from "@/components/richTextEditor/JobDescriptionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import {z} from "zod";


interface iAppProps {
  jobPost: {
    jobTitle: string;
    employmentType: string;
    location: string;
    salaryFrom: number;
    salaryTo: number;
    jobDescription: string;
    listingDuration: number;
    benefits: string[];
    id: string;
    Company: {
        location: string;
        name: string;
        about: string | null;
        website: string;
        xAccount: string | null;
        logo: string | null;
    };
}
}


export function EditJobForm({ jobPost }: iAppProps) {

    type JobSchemaType = z.infer<typeof jobSchema>;

      const form = useForm<JobSchemaType>({
        resolver: zodResolver(jobSchema) as any,
        defaultValues: {
          benefits: jobPost?.benefits,
          companyAbout: jobPost?.Company.about || "",
          companyName: jobPost?.Company.name,
          companyLocation: jobPost?.Company.location,
          companyWebsite: jobPost?.Company.website,
          companyLogo: jobPost?.Company.logo || "",
          companyXAccount: jobPost?.Company.xAccount || "",
          employmentType: jobPost?.employmentType,
          jobDescription: jobPost?.jobDescription,
          jobTitle: jobPost?.jobTitle,
          listingDuration: jobPost?.listingDuration,
          location: jobPost?.location,
          salaryFrom: jobPost?.salaryFrom,
          salaryTo: jobPost?.salaryTo,
        },
      });
    
      const [pending,setPending] = useState(false);
      const [submitError, setSubmitError] = useState<string | null>(null);

        async function onSubmit(values: JobSchemaType) {
          try {
            setPending(true);
            setSubmitError(null);
            
            await editJobPost(values, jobPost.id);
          } catch (error) {
            if(error instanceof Error && error.message !== "NEXT_REDIRECT") {
              console.error("Something went wrong", error);
              setSubmitError(error.message || "An error occurred while creating the job");
            }
          } finally{
            setPending(false);
          }
        }

      return (
    <Form {...form}>
      <form
        className="col-span-1 lg:col-span-2 flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Employment type</SelectLabel>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Worldwide</SelectLabel>
                          <SelectItem value="worldwide">
                            <span>🌍</span>
                            <span className="pl-2">Worldwide / Remote</span>
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Location</SelectLabel>
                          {countryList?.map((country) => (
                            <SelectItem
                              key={country?.code}
                              value={country?.name}
                            >
                              <Image
                                src={country?.image}
                                alt={country?.name}
                                width={20}
                                height={20}
                              />
                              <span className="pl-2">{country?.name}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Salary Range </FormLabel>
                <FormControl>
                  <SalaryRangeSelector
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={form.control as any}
                    minSalary={10000}
                    maxSalary={10000000}
                    currency="INR"
                    step={1000}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <JobDescriptionEditor field={field as any} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <BenefitsSelector field={field as unknown as ControllerRenderProps} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="company name..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Worldwide</SelectLabel>
                          <SelectItem value="worldwide">
                            <span>🌍</span>
                            <span className="pl-2">Worldwide / Remote</span>
                          </SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Location</SelectLabel>
                          {countryList?.map((country) => (
                            <SelectItem
                              key={country?.code}
                              value={country?.name}
                            >
                              <Image
                                src={country?.image}
                                alt={country?.name}
                                width={20}
                                height={20}
                              />
                              <span className="pl-2">{country?.name}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Website</FormLabel>
                    <FormControl>
                      <Input placeholder="company website..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyXAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company X Account</FormLabel>
                    <FormControl>
                      <Input placeholder="company X Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="companyAbout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Say something about your company"
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo</FormLabel>

                  <FormControl>
                    <div>
                      {field.value ? (
                        <div className="relative w-fit">
                          <Image
                            src={field.value}
                            alt="Company Logo"
                            width={100}
                            height={100}
                            className="rounded-lg"
                          />

                          <Button
                            type="button"
                            variant="destructive"
                            className="absolute -top-2 -right-2 p-1 rounded-full"
                            size="icon"
                            onClick={() => field.onChange("")}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <UploadDropzone
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            field.onChange(res[0]?.url ?? "");
                          }}
                          onUploadError={(error) => {
                            console.error("Upload failed", error);
                          }}
                          className="ut-button:bg-primary ut-button:text-white ut-button:hover:bg-primary/90 ut-label:text-muted-foreground ut-allowed-content:text-muted-foreground border-primary"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Edit Job Post"}
        </Button>

        {submitError && (
          <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-md border border-red-200">
            {submitError}
          </div>
        )}
      </form>
    </Form>
  );
} 