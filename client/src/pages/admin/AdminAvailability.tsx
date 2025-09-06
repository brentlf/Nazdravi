import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface UnavailableSlot {
  id?: string;
  date: string;
  timeslots: string[];
  reason?: string;
  createdAt: Date;
}

export default function AdminAvailability() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { data: unavailableSlots, loading } = useFirestoreCollection<UnavailableSlot>("unavailableSlots");
  const { add: addUnavailableSlot, remove: removeUnavailableSlot } = useFirestoreActions("unavailableSlots");

  // Controls for search, filter, sort, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortOption, setSortOption] = useState<
    "date_desc" | "date_asc" | "reason_asc" | "reason_desc" | "slots_desc" | "slots_asc"
  >("date_desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00"
  ];

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a date and at least one time slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUnavailableSlot({
        date: selectedDate,
        timeslots: selectedTimes,
        reason: reason || "Not available",
        createdAt: new Date(),
      });

      toast({
        title: "Availability updated",
        description: "Selected time slots have been marked as unavailable.",
      });

      setSelectedDate("");
      setSelectedTimes([]);
      setReason("");
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    try {
      await removeUnavailableSlot(slotId);
      toast({
        title: "Availability restored",
        description: "Time slots are now available for booking.",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Derived, filtered, sorted list
  const filteredAndSortedSlots = useMemo(() => {
    const normalize = (v: string) => v.toLowerCase();
    const queryLower = normalize(searchQuery.trim());

    const withinRange = (dateStr: string) => {
      if (!startDateFilter && !endDateFilter) return true;
      const dateValue = new Date(dateStr).getTime();
      if (startDateFilter) {
        const start = new Date(startDateFilter).getTime();
        if (dateValue < start) return false;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter).getTime();
        if (dateValue > end) return false;
      }
      return true;
    };

    const searched = (slot: UnavailableSlot) => {
      if (!queryLower) return true;
      const reasonMatch = slot.reason ? normalize(slot.reason).includes(queryLower) : false;
      const dateText = new Date(slot.date).toLocaleDateString();
      const dateMatch = normalize(dateText).includes(queryLower) || normalize(slot.date).includes(queryLower);
      const timeMatch = (slot.timeslots || []).some(t => normalize(t).includes(queryLower));
      return reasonMatch || dateMatch || timeMatch;
    };

    const filtered = (unavailableSlots || []).filter(s => withinRange(s.date) && searched(s));

    const sorted = [...filtered].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      const aReason = (a.reason || "").toLowerCase();
      const bReason = (b.reason || "").toLowerCase();
      const aCount = (a.timeslots || []).length;
      const bCount = (b.timeslots || []).length;
      switch (sortOption) {
        case "date_asc":
          return aDate - bDate;
        case "date_desc":
          return bDate - aDate;
        case "reason_asc":
          return aReason.localeCompare(bReason);
        case "reason_desc":
          return bReason.localeCompare(aReason);
        case "slots_asc":
          return aCount - bCount;
        case "slots_desc":
          return bCount - aCount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [unavailableSlots, searchQuery, startDateFilter, endDateFilter, sortOption]);

  // Pagination derivation
  const totalItems = filteredAndSortedSlots.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedSlots = filteredAndSortedSlots.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDateFilter, endDateFilter, sortOption, pageSize]);

  // Ensure current page stays valid when items change (e.g., delete)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Manage Availability</h1>
          <p className="text-muted-foreground">
            Set your unavailable dates and times for client bookings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Unavailable Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#A5CBA4]" />
                Block Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label>Select Time Slots to Block</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTimes.includes(time) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeToggle(time)}
                      className={selectedTimes.includes(time) ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Conference, Personal appointment"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full bg-[#A5CBA4] hover:bg-[#95bb94] text-white"
                disabled={!selectedDate || selectedTimes.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Block Selected Times
              </Button>
            </CardContent>
          </Card>

          {/* Current Unavailable Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A5CBA4]" />
                Current Blocked Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters & Controls */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search reason, date, or time"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Sort</Label>
                  <Select value={sortOption} onValueChange={(v) => setSortOption(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Date: Newest first</SelectItem>
                      <SelectItem value="date_asc">Date: Oldest first</SelectItem>
                      <SelectItem value="reason_asc">Reason: A → Z</SelectItem>
                      <SelectItem value="reason_desc">Reason: Z → A</SelectItem>
                      <SelectItem value="slots_desc">Slots: Most → Least</SelectItem>
                      <SelectItem value="slots_asc">Slots: Least → Most</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Rows per page</Label>
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={() => { setSearchQuery(""); setStartDateFilter(""); setEndDateFilter(""); setSortOption("date_desc"); setPageSize(10); }}>
                    Clear filters
                  </Button>
                </div>
              </div>

              {/* Results count */}
              {!loading && (
                <div className="text-sm text-muted-foreground mb-3">
                  Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} result{totalItems === 1 ? "" : "s"}
                </div>
              )}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : paginatedSlots && paginatedSlots.length > 0 ? (
                <div className="space-y-4">
                  {paginatedSlots.map((slot) => (
                    <div key={slot.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(slot.date).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {slot.timeslots.map((time) => (
                              <span key={time} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                {time}
                              </span>
                            ))}
                          </div>
                          {slot.reason && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Reason: {slot.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSlot(slot.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blocked time slots</h3>
                  <p className="text-muted-foreground">
                    All time slots are currently available for client bookings.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                          className={currentPageSafe === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNumber = idx + 1;
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              href="#"
                              isActive={pageNumber === currentPageSafe}
                              onClick={(e) => { e.preventDefault(); setCurrentPage(pageNumber); }}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                          className={currentPageSafe === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}