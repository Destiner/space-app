"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";

import styles from "./page.module.css";

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 1000);

  const endpoint = process.env.NEXT_PUBLIC_SUBGRAPH_ENDPOINT;
  if (!endpoint) {
    throw new Error("Missing NEXT_PUBLIC_SUBGRAPH_ENDPOINT");
  }

  const searchRequest = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) {
        return {
          data: {
            link_search: [],
            name_search: [],
            bio_search: [],
          },
        };
      }

      const query = `
        query Search($query: String) {
          link_search: links(first: 10, where: { label_contains_nocase: $query }) {
            label
            value
            space {
              id
              name
            }
          }
          name_search: spaces(first: 10, where: { name_contains_nocase: $query }) {
            id
            name
            bio
          }
          bio_search: spaces(first: 10, where: { bio_contains_nocase: $query }) {
            id
            name
            bio
          }
        }
      `;

      const variables = {
        query: debouncedQuery,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await response.json();
      return data.data;
    },
  });

  useEffect(() => {
    searchRequest.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const [linkResults, setLinkResults] = useState([]);
  const [nameResults, setNameResults] = useState([]);
  const [bioResults, setBioResults] = useState([]);

  useEffect(() => {
    if (searchRequest.data) {
      setLinkResults(searchRequest.data.link_search || []);
      setNameResults(searchRequest.data.name_search || []);
      setBioResults(searchRequest.data.bio_search || []);
    }
  }, [searchRequest.data]);

  const hasResults = useMemo(() => {
    return linkResults.length || nameResults.length || bioResults.length;
  }, [linkResults, nameResults, bioResults]);
  const spaceResults = useMemo(() => {
    return [...nameResults, ...bioResults].reduce(
      (
        acc: {
          id: string;
          name: string;
          bio: string;
        }[],
        curr: {
          id: string;
          name: string;
          bio: string;
        }
      ) => {
        if (!acc.find((item) => item.id === curr.id)) {
          acc.push(curr);
        }
        return acc;
      },
      []
    );
  }, [nameResults, bioResults]);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Search</h1>
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {hasResults ? (
          <div className={styles.results}>
            {spaceResults.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionHeading}>Spaces</h2>
                <div className={styles.sectionItems}>
                  {spaceResults.map((result: any) => (
                    <a
                      key={result.id}
                      className={styles.sectionItem}
                      href={`/space/${result.id}`}
                    >
                      <div className={styles.itemSpaceName}>{result.name}</div>
                      <div className={styles.itemSpaceBio}>{result.bio}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {linkResults.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionHeading}>Links</h2>
                <div className={styles.sectionItems}>
                  {linkResults.map((result: any, index) => (
                    <a
                      key={index}
                      className={styles.sectionItem}
                      href={`/space/${result.space.id}`}
                    >
                      <div className={styles.itemSpaceName}>
                        {result.space.name}
                      </div>
                      <div className={styles.itemLinkLabel}>{result.label}</div>
                      <div className={styles.itemLinkValue}>{result.value}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.resultsEmpty}>No results</div>
        )}
      </div>
    </div>
  );
};

export default Search;
