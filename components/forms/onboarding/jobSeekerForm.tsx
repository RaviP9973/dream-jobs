import { createJobSeeker } from "@/app/actions";
import { jobseekerSchema } from "@/app/utils/zodSchemas";
import { UploadDropzone } from "@/components/general/UploadThingReexported";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PDFImage from "@/public/pdf.png"

export function JobseekerForm() {
  const form = useForm<z.infer<typeof jobseekerSchema>>({
    resolver: zodResolver(jobseekerSchema),
    defaultValues: {
      name: "",
      about: "",
      resume: "",
    },
  });

  const [pending,setPending] = useState(false);
  async function onSubmit(data: z.infer<typeof jobseekerSchema>) {
    try {
      setPending(true);
      await createJobSeeker(data);
    } catch (error) {
      console.error("Error creating job seeker:", error);
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-6"  onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>

              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>

              <FormControl>
                <Textarea placeholder="Tell us about yourself..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume (PDF)</FormLabel>

              <FormControl>
                <div>
                  {field.value ? (
                    <div className="relative w-fit">
                      <Image
                        src={PDFImage}
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
                      endpoint="resumeUploader"
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

        <Button disabled={pending} type="submit" className="w-full">
          {pending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
