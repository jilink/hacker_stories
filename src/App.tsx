import logo from "./logo.svg";
import styles from "./App.module.css";
import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";
import List from "./List";
import SearchForm from "./SearchForm";

const StyledContainer = styled.div`
  height: 100vw;
  padding: 20px;
  background: #83a4d4;
  background: linear-gradient(to left, #b6fbff, #83a4d4);
  color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
  font-size: 48px;
  font-weight: 300;
  letter-spacing: 2px;
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

type Stories = Array<Story>;

const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void] => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);
  return [value, setValue];
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: "STORIES_FETCH_INIT";
}

interface StoriesFetchSucessAction {
  type: "STORIES_FETCH_SUCESS";
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: "STORIES_FETCH_FAILURE";
}

interface StoriesRemoveAction {
  type: "REMOVE_STORIES";
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSucessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORIES":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const getUrl = (searchTerm: string) => `${API_ENDPOINT}${searchTerm}`;
const extractSearchTerm = (url: string) => url.replace(API_ENDPOINT, "");
const getLastSearches = (urls: string[]) =>
  urls
    .reduce((result: string[], url, index) => {
      const searchTerm: string = extractSearchTerm(url);
      if (index === 0) {
        return result.concat(searchTerm);
      }

      const previousSearchTerm = result[result.length - 1];
      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1)
    .map((url) => extractSearchTerm(url));

type LastSearchProps = {
  lastSearches: string[];
  onLastSearch: (searchTerm: string) => void;
};
const LastSearch = ({ lastSearches, onLastSearch }: LastSearchProps) => (
  <>
    {lastSearches.map((searchTerm, index) => (
      <button
        key={searchTerm + index}
        type="button"
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    ))}
  </>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [urls, setUrls] = React.useState([getUrl(searchTerm)]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const url = getUrl(searchTerm);
    setUrls(urls.concat(url));
    event.preventDefault(); // html basic behaviour wouls reload the page
  };

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  const handleFetchStories = React.useCallback(async () => {
    if (!searchTerm) return;
    dispatchStories({ type: "STORIES_FETCH_INIT" });
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);
      dispatchStories({
        type: "STORIES_FETCH_SUCESS",
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({
      type: "REMOVE_STORIES",
      payload: item,
    });
  }, []);

  const handleLastSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    const url = getUrl(searchTerm);
    setUrls(urls.concat(url));
  };

  const lastSearches = getLastSearches(urls);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My hacker stories</StyledHeadlinePrimary>

      <SearchForm
        onSearchSubmit={handleSearchSubmit}
        onSearchInput={handleSearchInput}
        searchTerm={searchTerm}
      />
      <LastSearch lastSearches={lastSearches} onLastSearch={handleLastSearch} />
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>Loading ... </p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </StyledContainer>
  );
};

export default App;

export { storiesReducer };
