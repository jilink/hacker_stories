import React from "react";
import styled from "styled-components";
import styles from "./App.module.css";
import InputWithLabel from "./InputWithLabel";

const StyledSearchForm = styled.form`
  padding: 10px 0 20px 0;
  display: flex;
  align-items: baseline;
`;

const StyledButton = styled.button`
  background: transparent;
  border: 1px solid #171212;
  padding: 5px;
  cursor: pointer;

  transition: all 0.1s ease-in;

  &:hover {
    background: #171212;
    color: #ffffff;
  }
`;

const StyledButtonLarge = styled(StyledButton)`
  padding: 10px;
`;

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}: SearchFormProps) => (
  <StyledSearchForm onSubmit={onSearchSubmit} className={styles.SearchForm}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      onInputChange={onSearchInput}
      isFocused
    >
      Search:
    </InputWithLabel>

    <StyledButtonLarge
      type="submit"
      disabled={!searchTerm}
      className={`${styles.button} ${styles.buttonLarge}`}
    >
      Submit
    </StyledButtonLarge>
  </StyledSearchForm>
);

export default SearchForm;
