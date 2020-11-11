import React, { useState } from "react";
import styled from "styled-components";
import styles from "./App.module.css";
import { ReactComponent as Check } from "./check.svg";
import { sortBy } from "lodash";

const StyledColumn = styled.span<{ width: string }>`
  padding: 0 5px;
  white-space: nowrap;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  a {
    color: inherit;
  }

  width: ${(props) => props.width};
`;

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
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

const StyledButtonSmall = styled(StyledButton)`
  padding: 5px;
`;

const SortButton = styled.button`
  cursor: pointer;
  background: transparent;
  box-shadow: 0px 0px 0px transparent;
  border: 0px solid transparent;
  text-shadow: 0px 0px 0px transparent;
  &:focus {
    outline: none;
  }
`;

interface Sort {
  [key: string]: (list: Stories) => Stories;
}

const SORTS: Sort = {
  NONE: (list: Stories) => list,
  TITLE: (list: Stories) => sortBy(list, "title"),
  AUTHOR: (list: Stories) => sortBy(list, "author"),
  COMMENT: (list: Stories) => sortBy(list, "num_comments").reverse(),
  POINT: (list: Stories) => sortBy(list, "points").reverse(),
};

type Stories = Array<Story>;

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

const List = ({ list, onRemoveItem }: ListProps) => {
  const [sort, setSort] = useState({ sortKey: "NONE", isReverse: false });
  const handleSort = (sortkey: string) => {
    const isReverse = sort.sortKey === sortkey && !sort.isReverse;
    setSort({ sortKey: sortkey, isReverse: isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <>
      <StyledItem>
        <StyledColumn width="40%">
          <SortButton onClick={() => handleSort("TITLE")}>Title</SortButton>
        </StyledColumn>
        <StyledColumn width="30%">
          <SortButton onClick={() => handleSort("AUTHOR")}>Author</SortButton>
        </StyledColumn>
        <StyledColumn width="10%">
          <SortButton onClick={() => handleSort("COMMENT")}>
            Comments
          </SortButton>
        </StyledColumn>
        <StyledColumn width="10%">
          <SortButton onClick={() => handleSort("POINT")}>Points</SortButton>
        </StyledColumn>
        <StyledColumn width="10%"></StyledColumn>
      </StyledItem>
      {sortedList.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </>
  );
};

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => {
  return (
    <StyledItem>
      <StyledColumn width="40%">
        <a href={item.url}>{item.title}</a>
      </StyledColumn>
      <StyledColumn width="30%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points}</StyledColumn>
      <StyledColumn width="10%">
        <StyledButtonSmall
          type="button"
          onClick={() => onRemoveItem(item)}
          className={`${styles.button} ${styles.buttonSmall}`}
        >
          <Check height="18px" width="18px" />
        </StyledButtonSmall>
      </StyledColumn>
    </StyledItem>
  );
};
export default List;
