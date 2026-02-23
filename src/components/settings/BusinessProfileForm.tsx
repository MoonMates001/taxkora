import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, User, Mail, Phone, MapPin, Save, Loader2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth, Profile } from "@/hooks/useAuth";
import { useProfile, ProfileUpdate } from "@/hooks/useProfile";
import { AFRICAN_COUNTRIES, OTHER_COUNTRIES } from "@/lib/countries";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  business_name: z.string().max(100).optional().nullable(),
  business_address: z.string().max(200).optional().nullable(),
  business_city: z.string().max(50).optional().nullable(),
  business_state: z.string().max(50).optional().nullable(),
  country_of_residence: z.string().max(100).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const BusinessProfileForm = () => {
  const { profile } = useAuth();
  const { updateProfile } = useProfile();
  const isBusinessAccount = profile?.account_type === "business";

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      business_name: profile?.business_name || "",
      business_address: profile?.business_address || "",
      business_city: profile?.business_city || "",
      business_state: profile?.business_state || "",
      country_of_residence: profile?.country_of_residence || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        business_name: profile.business_name || "",
        business_address: profile.business_address || "",
        business_city: profile.business_city || "",
        business_state: profile.business_state || "",
        country_of_residence: profile.country_of_residence || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    const updates: ProfileUpdate = {
      full_name: data.full_name,
      phone: data.phone || null,
      business_name: data.business_name || null,
      business_address: data.business_address || null,
      business_city: data.business_city || null,
      business_state: data.business_state || null,
      country_of_residence: data.country_of_residence || null,
    };
    await updateProfile.mutateAsync(updates);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          {isBusinessAccount ? (
            <Building2 className="w-5 h-5 text-primary" />
          ) : (
            <User className="w-5 h-5 text-accent" />
          )}
          {isBusinessAccount ? "Business Profile" : "Personal Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
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

              <div className="space-y-2">
                <FormLabel>Email Address</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    defaultValue={profile?.email || ""}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your phone number"
                          className="pl-10"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isBusinessAccount && (
                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your business name"
                            className="pl-10"
                            {...field}
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Country of Residence */}
            <FormField
              control={form.control}
              name="country_of_residence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Country of Residence
                  </FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Africa</SelectLabel>
                        {AFRICAN_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Rest of World</SelectLabel>
                        {OTHER_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Address Section */}
            {isBusinessAccount && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Business Address
                </h3>
                
                <FormField
                  control={form.control}
                  name="business_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your business address"
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="business_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter state"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="gap-2" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
