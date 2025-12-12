"use client";

import { Car, Mail, MapPin, Phone, Search, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGarageInfo } from "@/hooks/use-garage-info";

export default function Page() {
  const router = useRouter();
  const { data: garageInfo, isLoading: isGarageInfoLoading } = useGarageInfo();
  const t = useTranslations("landing");

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-16">
        {/* Language Switcher */}
        <div className="mb-8 flex justify-end gap-1">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        {/* Show loading state while fetching garage info */}
        {isGarageInfoLoading ? (
          <div className="mb-16 text-center">
            <div className="animate-pulse">
              <div className="mx-auto mb-4 h-12 w-96 rounded bg-gray-200" />
              <div className="mx-auto h-6 w-80 rounded bg-gray-200" />
            </div>
          </div>
        ) : (
          <>
            {/* Banner Image with Logo */}
            {garageInfo?.bannerImageUrl || garageInfo?.logoImageUrl ? (
              <div className="mb-8 flex justify-center">
                <div className="relative aspect-[4/1] w-full max-w-7xl overflow-hidden rounded-2xl border bg-gray-100">
                  {/* Banner Image */}
                  {garageInfo.bannerImageUrl && (
                    <div className="absolute inset-0">
                      <Image
                        src={garageInfo.bannerImageUrl}
                        alt="Garage Banner"
                        width={2048}
                        height={512}
                        className={`h-full w-full object-cover ${
                          garageInfo.logoPosition === "left"
                            ? "object-[75%_center]"
                            : garageInfo.logoPosition === "right"
                              ? "object-[25%_center]"
                              : "object-center"
                        }`}
                        priority
                      />
                    </div>
                  )}

                  {/* Logo Overlay */}
                  {garageInfo.logoImageUrl &&
                  garageInfo.logoPosition !== "none" ? (
                    <div
                      className={`absolute inset-0 flex items-center ${
                        garageInfo.logoPosition === "left"
                          ? "justify-start pl-16"
                          : "justify-end pr-16"
                      }`}
                    >
                      <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-white">
                        <Image
                          src={garageInfo.logoImageUrl}
                          alt="Garage Logo"
                          width={196}
                          height={196}
                          priority
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Fallback when no banner */}
                  {!garageInfo.bannerImageUrl && garageInfo.logoImageUrl && (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-sm">
                        No banner image
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Header */}
            <div className="mb-16 text-center">
              <h1 className="mb-4 font-bold text-5xl">
                {garageInfo?.garageName || t("title")}
              </h1>
              <p className="text-slate-600 text-xl">{t("subtitle")}</p>

              {/* Contact Information */}
              {garageInfo && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-wrap justify-center gap-6 text-slate-600">
                    {garageInfo.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <Label>{garageInfo.phoneNumber}</Label>
                      </div>
                    )}
                    {garageInfo.emailAddress && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label>{garageInfo.emailAddress}</Label>
                      </div>
                    )}
                    {garageInfo.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <Label>{garageInfo.address}</Label>
                      </div>
                    )}
                  </div>

                  {/* Show message if no contact info */}
                  {!garageInfo.phoneNumber &&
                    !garageInfo.emailAddress &&
                    !garageInfo.address && (
                      <div className="text-slate-500 text-sm">
                        {t("contactConfig")}
                      </div>
                    )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Main Options */}
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Staff Login */}
          <Card className="hover:-translate-y-1 transform cursor-pointer transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">
                {t("staffLogin.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-slate-600">
                {t("staffLogin.description")}
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-blue-600 py-3 text-lg hover:bg-blue-700"
              >
                {t("staffLogin.button")}
              </Button>
            </CardContent>
          </Card>

          {/* Customer Tracking */}
          <Card className="hover:-translate-y-1 transform cursor-pointer transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                {t("trackOrder.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-slate-600">
                {t("trackOrder.description")}
              </p>
              <Button
                onClick={() => router.push("/track-order")}
                className="w-full bg-green-600 py-3 text-lg hover:bg-green-700"
              >
                {t("trackOrder.button")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {t("features.vehicleManagement.title")}
              </h3>
              <p className="text-slate-600">
                {t("features.vehicleManagement.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {t("features.staffManagement.title")}
              </h3>
              <p className="text-slate-600">
                {t("features.staffManagement.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {t("features.customerTracking.title")}
              </h3>
              <p className="text-slate-600">
                {t("features.customerTracking.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
