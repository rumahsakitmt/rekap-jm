import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";

const Search = () => {
  return (
    <InputGroup>
      <InputGroupInput placeholder="Cari..." />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Cari</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default Search;
