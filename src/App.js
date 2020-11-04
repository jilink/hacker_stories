import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";

const List = (props) => {
  return props.list.map((item) => (
    <div key={item.objectId}>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
    </div>
  ));
};

const App = () => {
  const stories = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan walke",
      num_comments: 3,
      points: 4,
      objectId: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan truc",
      num_comments: 2,
      points: 5,
      objectId: 1,
    },
  ];
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.filter(function (story) {
    return story.title.includes(searchTerm);
  });

  return (
    <div>
      <h1>My hacker stories</h1>

      <Search onSearch={handleSearch} />
      <p>
        <strong>{searchTerm}</strong>
      </p>
      <hr />
      <List list={searchedStories} />
    </div>
  );
};

const Search = (props) => {
  return (
    <React.Fragment>
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" onChange={props.onSearch} />
    </React.Fragment>
  );
};

export default App;
