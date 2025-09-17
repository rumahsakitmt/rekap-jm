import React, { useState, useCallback } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";

const SearchInput = ({ from }: { from: "/rawat-inap" | "/" }) => {
  const route = getRouteApi(from);
  const searchParams = route.useSearch();
  const navigate = route.useNavigate();
  const [localSearch, setLocalSearch] = useState(searchParams.search || "");

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    navigate({
      search: (prev) => ({
        ...prev,
        search: "",
      }),
    });
  }, []);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      navigate({
        search: (prev) => ({
          ...prev,
          search: localSearch,
        }),
      });
    },
    [localSearch, navigate]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2 items-center">
      <div className="relative w-full">
        <Input
          placeholder="Cari berdasarkan nama pasien/no rm/no rawat/sep..."
          value={localSearch}
          onChange={handleSearch}
          className="w-full placeholder:uppercase"
        />
        {localSearch && (
          <div className="absolute right-0 top-0 ">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
            >
              <X />
            </Button>
          </div>
        )}
      </div>
      <Button disabled={localSearch === ""} type="submit">
        Cari
      </Button>
    </form>
  );
};

export default SearchInput;
