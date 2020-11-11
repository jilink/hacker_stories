import React from "react";
import App, {
  storiesReducer,
  Item,
  List,
  SearchForm,
  InputWithLabel,
} from "./App";
import {
  render,
  screen,
  fireEvent,
  act,
  getByText,
  getAllByText,
} from "@testing-library/react";
import axios from "axios";

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

jest.mock("axios");

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

  it("renders snapshort", () => {
    const { container } = render(<SearchForm {...searchFormProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("App", () => {
  it("succees fetching data", async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    expect(screen.queryByText(/Loading/)).toBeInTheDocument();
    await act(() => promise);
    expect(screen.queryByText(/Loading/)).toBeNull();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Redux")).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBe(3);
  });

  it("fails fetching data", async () => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    expect(screen.getByText(/Loading/)).toBeInTheDocument();

    try {
      await act(() => promise);
    } catch (error) {
      console.log(error);
    }
  });

  it("removes a story", async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    axios.get.mockImplementationOnce(() => promise);

    render(<App />);
    await act(() => promise);
    expect(screen.getAllByRole("button").length).toBe(3);
    expect(screen.getByText("Jordan Walke")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(screen.getAllByRole("button").length).toBe(2);
    expect(screen.queryByText("Jordan Walke")).toBeNull();
  });

  it("searche for spcific stories", async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories,
      },
    });

    const anotherStory = {
      title: "Javascript",
      url: "https://en.wikipdia.org/wiki/Javascript",
      author: "Brendan Eich",
      num_comments: 15,
      points: 10,
      objectID: 3,
    };

    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });

    axios.get.mockImplementationOnce((url) => {
      if (url.includes("React")) {
        return reactPromise;
      }
      if (url.includes("Javascript")) {
        return javascriptPromise;
      }
      throw Error();
    });

    //Initial render
    render(<App />);

    // First data fetching

    await act(() => reactPromise);

    expect(screen.queryByDisplayValue("React")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Javascript")).toBeNull();

    expect(screen.queryByText("Jordan Walke")).toBeInTheDocument();

    expect(screen.queryByText("Dan abramov")).toBeInTheDocument();
    expect(screen.queryByText("Brendan Eich")).toBeNull();

    // User interaction -> Search

    fireEvent.change(screen.queryByDisplayValue("React"), {
      target: {
        value: "Javascript",
      },
    });

    expect(screen.queryByDisplayValue("React")).toBeNull();
    expect(screen.queryByDisplayValue("Javascript")).toBeInTheDocument();

    // fireEvent.submit(screen.queryByText(/Submit/));

    // // Second Data Fetching

    // await act(() => javascriptPromise);

    // expect(screen.queryByText("Jordan Walke")).toBeNull();
    // expect(screen.queryByText("Dan abramov")).toBeNull();
    // expect(screen.queryByText("Brendan Eich")).toBeInTheDocument();
  });
});
