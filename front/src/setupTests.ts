// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';

expect.extend(matchers);

// Slower machines (and the first render after loading Lingui) can take longer than the default 1000 ms
configure({ asyncUtilTimeout: 5000 });

afterEach(() => {
  cleanup();
});
