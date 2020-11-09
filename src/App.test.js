import React from "react";
import App, {
  storiesReducer,
  Item,
  List,
  SearchForm,
  InputWithLabel,
} from "./App";
import { render, screen, fireEvent, act } from "@testing-library/react";

const storyOne = {
  title: "React",
  url: "https://reactjs.org",
  author: "Jordan Walke",
  num_comments: 3,
  points: 4,
  objectID: 0,
};

const storyTwo = {
  title: "Redux",
  url: "https://redux.js.org",
  author: "Dan abramov",
  num_comments: 2,
  points: 5,
  objectID: 1,
};

const stories = [storyOne, storyTwo];

describe("storiesReducer", () => {
  it("removes a sotry from all stories", () => {
    const action = { type: "REMOVE_STORIES", payload: storyOne };
    const state = { data: stories, isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyTwo],
      isLoading: false,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });
  it("test fetching stories", () => {
    const action = { type: "STORIES_FETCH_INIT" };
    const state = { data: stories, isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyOne, storyTwo],
      isLoading: true,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });
  it("test fetching success", () => {
    const action = { type: "STORIES_FETCH_SUCESS", payload: stories };
    const state = { data: [], isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [storyOne, storyTwo],
      isLoading: false,
      isError: false,
    };
    expect(newState).toStrictEqual(expectedState);
  });
  it("test fetching failure", () => {
    const action = { type: "STORIES_FETCH_FAILURE" };
    const state = { data: [], isLoading: false, isError: false };

    const newState = storiesReducer(state, action);

    const expectedState = {
      data: [],
      isLoading: false,
      isError: true,
    };
    expect(newState).toStrictEqual(expectedState);
  });
});

describe("Item", () => {
  it("renders all properties", () => {
    render(<Item item={storyOne} />);
    expect(screen.getByText("Jordan Walke")).toBeInTheDocument();
    expect(screen.getByText("React")).toHaveAttribute(
      "href",
      "https://reactjs.org"
    );
  });
  it("renders a clickable dismiss button", () => {
    render(<Item item={storyOne} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
  it("clicking the dimsiss button class he callback handler", () => {
    const handleRemoveItem = jest.fn();
    render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleRemoveItem).toHaveBeenCalledTimes(1);
  });
});

describe("SearchForm", () => {
  const searchFormProps = {
    searchTerm: "React",
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  };

  it("renders the input field with its vallue", () => {
    render(<SearchForm {...searchFormProps} />);
    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
  });
  it("renders the correct label", () => {
    render(<SearchForm {...searchFormProps} />);
    expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
  });

  it("calls onSearchInput on inout field change", () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.change(screen.getByDisplayValue("React"), {
      target: { value: "Redux" },
    });

    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  it("calls onSearch submit click on submit", () => {
    render(<SearchForm {...searchFormProps} />);
    fireEvent.submit(screen.getByRole("button"));

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});
