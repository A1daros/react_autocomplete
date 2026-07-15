import React, { useEffect, useMemo, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';

interface Person {
  name: string;
  born: number;
  died: number;
}

interface Props {
  delay?: number;
  onSelected?: (person: Person | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export const App: React.FC<Props> = ({ delay = 300, onSelected }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useMemo(() => {
    return debounce((value: string) => setDebouncedQuery(value), delay);
  }, [delay]);

  useEffect(() => {
    debouncedSetQuery(query);
  }, [debouncedSetQuery, query]);

  const filteredPeople = useMemo(() => {
    if (!debouncedQuery) {
      return peopleFromServer;
    }

    return peopleFromServer.filter(person => {
      return person.name.toLowerCase().includes(debouncedQuery.toLowerCase());
    });
  }, [debouncedQuery]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setQuery(value);

    if (selectedPerson && selectedPerson.name !== value) {
      setSelectedPerson(null);
      onSelected?.(null);
    }
  };

  const handleSelect = (person: Person) => {
    setSelectedPerson(person);
    setQuery(person.name);
    onSelected?.(person);

    setIsFocused(false);
  };

  const showDropdown =
    isFocused && (query.trim() === '' || filteredPeople.length > 0);

  const showNoResult =
    isFocused && query.trim() !== '' && filteredPeople.length === 0;

  const shouldShowSelected = selectedPerson !== null;

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {shouldShowSelected ? (
            `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
          ) : (
            <p className="has-text-danger">No selected person</p>
          )}
        </h1>

        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              data-cy="search-input"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="input"
            />
          </div>

          {showDropdown && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {filteredPeople.map(person => (
                  <div
                    key={person.name}
                    className="dropdown-item is-hovered"
                    data-cy="suggestion-item"
                    style={{ cursor: 'pointer' }}
                    onMouseDown={() => handleSelect(person)}
                  >
                    <p
                      className={`has-text-link ${selectedPerson?.name === person.name ? 'has-text-danger' : ''}`}
                    >
                      {person.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showNoResult && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
