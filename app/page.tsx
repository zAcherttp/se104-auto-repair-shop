"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Users, Search, Phone, Mail, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGarageInfo } from "@/hooks/use-garage-info";

export default function Page() {
  const router = useRouter();
  const { data: garageInfo, isLoading: isGarageInfoLoading } = useGarageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-16">
        {/* Show loading state while fetching garage info */}
        {isGarageInfoLoading ? (
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 mx-auto w-96"></div>
              <div className="h-6 bg-gray-200 rounded mx-auto w-80"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-4">
                {garageInfo?.garageName || "AutoRepair Manager"}
              </h1>
              <p className="text-xl text-slate-600">
                Comprehensive vehicle repair management system
              </p>

              {/* Contact Information */}
              {garageInfo && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-wrap justify-center gap-6 text-slate-600">
                    {garageInfo.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{garageInfo.phoneNumber}</span>
                      </div>
                    )}
                    {garageInfo.emailAddress && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{garageInfo.emailAddress}</span>
                      </div>
                    )}
                    {garageInfo.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{garageInfo.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Show message if no contact info */}
                  {!garageInfo.phoneNumber &&
                    !garageInfo.emailAddress &&
                    !garageInfo.address && (
                      <div className="text-slate-500 text-sm">
                        Contact information can be configured in the admin
                        settings.
                      </div>
                    )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Staff Login */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Login as Garage Member</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-6">
                Access the management system to handle vehicle reception,
                repairs, and payments
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                Staff Login
              </Button>
            </CardContent>
          </Card>

          {/* Customer Tracking */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Track My Order</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-6">
                Check the status of your vehicle repair by entering your license
                plate number
              </p>
              <Button
                onClick={() => router.push("/track-order")}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
              >
                Track Order
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">
            Why Choose AutoRepair Manager?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Management</h3>
              <p className="text-slate-600">
                Complete vehicle reception and tracking system
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12  rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Staff Management</h3>
              <p className="text-slate-600">
                Role-based access control for admins and employees
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12  rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Tracking</h3>
              <p className="text-slate-600">
                Real-time order tracking for customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
