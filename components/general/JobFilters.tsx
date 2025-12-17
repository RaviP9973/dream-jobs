"use client";

import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { countryList } from "@/app/utils/countryList";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const jobTypes = ["full-time", "part-time", "contract", "internship"];

export function JobFilter() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const currentJobTypes = searchParams.get("jobTypes")?.split(",") || [];

  const currentLocation = searchParams.get("location") || "";

  const [, startTransition] = useTransition();

  function clearAllFilters() {
    startTransition(() => {
      router.push("/");
    });
  }

  const createQueueString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
        // return `?${params.toString()}`;
      } else {
        params.delete(name);
      }

      return params.toString();
    },
    [searchParams]
  );

  function handleJobTypeChange(jobType: string, checked: boolean) {
    const current = new Set(currentJobTypes);

    if (checked) {
      current.add(jobType);
    } else {
      current.delete(jobType);
    }
    startTransition(() => {
      router.push(
        `?${createQueueString("jobTypes", Array.from(current).join(","))}`
      );
    });
  }

  function handleLocationChange(location: string) {
    startTransition(() => {
      router.push(`?${createQueueString("location", location)}`);
    });
  }

  return (
    <Card className="col-span-1 h-fit">
      <CardHeader className="flex flex-row justify-between ">
        <CardTitle className="text-2xl font-semibold ">Filters</CardTitle>
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={clearAllFilters}
        >
          <span>Clear All</span>
          <XIcon className="size-4" />
        </Button>
      </CardHeader>

      <Separator className="mb-4" />
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-lg font-semibold"> Job Type</Label>
          <div className="grid grid-cols-2 gap-4">
            {jobTypes.map((job, index) => (
              <div key={index} className="flex  items-center space-x-2">
                <Checkbox
                  id={job}
                  checked={currentJobTypes.includes(job)}
                  onCheckedChange={(checked) =>
                    handleJobTypeChange(job, checked as boolean)
                  }
                />
                <Label className="text-sm font-medium" htmlFor={job}>
                  {job}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <Separator />

        <div className="space-y-4">
          <Label className="text-lg font-semibold"> Location </Label>
          <Select onValueChange={(location) => {
            handleLocationChange(location);
          }} value={currentLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
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
                  <SelectItem key={country?.code} value={country?.name}>
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
        </div>
      </CardContent>
    </Card>
  );
}
