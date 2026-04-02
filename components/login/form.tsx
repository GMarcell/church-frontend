"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LoginFormValues,
  loginSchema,
  MemberLoginFormValues,
  memberLoginSchema,
} from "@/schemas/auth.schema";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, memberLogin } from "@/services/auth";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"admin" | "member">("admin");

  const adminForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "ADMIN",
    },
  });

  const memberForm = useForm<MemberLoginFormValues>({
    resolver: zodResolver(memberLoginSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = adminForm;
  const selectedRole = useWatch({
    control: adminForm.control,
    name: "role",
  });

  const {
    register: registerMember,
    handleSubmit: handleSubmitMember,
    formState: {
      errors: memberErrors,
      isSubmitting: isMemberSubmitting,
    },
  } = memberForm;

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onSubmitMember = async (values: MemberLoginFormValues) => {
    try {
      await memberLogin(values);
      router.push("/dashboard/members");
    } catch (error) {
      console.error("Member login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex rounded-full border border-border/70 bg-white/70 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-2 text-sm transition ${mode === "admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("admin")}
            >
              Admin / Coordinator
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-2 text-sm transition ${mode === "member" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("member")}
            >
              Member
            </button>
          </div>

          <CardTitle>
            {mode === "admin" ? "Login to your account" : "Member self service"}
          </CardTitle>
          <CardDescription>
            {mode === "admin"
              ? "Enter your email, password, and role to access the dashboard."
              : "Login with your full name and birth date to update your own profile."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === "admin" ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue("role", value as "ADMIN" | "COORDINATOR", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitMember(onSubmitMember)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="member-name">Full Name</Label>
                  <Input
                    id="member-name"
                    placeholder="John Example"
                    {...registerMember("name")}
                  />
                  {memberErrors.name && (
                    <p className="text-sm text-red-500">
                      {memberErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="member-password">Birth Date</Label>
                  <Input
                    id="member-password"
                    placeholder="15-01-1990"
                    {...registerMember("password")}
                  />
                  {memberErrors.password && (
                    <p className="text-sm text-red-500">
                      {memberErrors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isMemberSubmitting}
              >
                {isMemberSubmitting ? "Logging in..." : "Login as Member"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
