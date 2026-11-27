import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { useLocalized } from './useLocalized';

function Text({ texts }: { texts: [string, string | null, string | null] }) {
  const localized = useLocalized();
  return <p>{localized(...texts)}</p>;
}

function renderIn(
  locale: string,
  texts: [string, string | null, string | null],
) {
  i18n.loadAndActivate({ locale, messages: {} });
  return render(
    <I18nProvider i18n={i18n}>
      <Text texts={texts} />
    </I18nProvider>,
  );
}

describe('useLocalized', () => {
  it("shows the interface language's version", () => {
    renderIn('sv', ['Pistoolirata', 'Pistolbana', 'Pistol range']);
    expect(screen.getByText('Pistolbana')).toBeInTheDocument();
  });

  it('falls back to Finnish when the translation is empty or missing', () => {
    const { unmount } = renderIn('en', ['Pistoolirata', 'Pistolbana', '  ']);
    expect(screen.getByText('Pistoolirata')).toBeInTheDocument();
    unmount();
    renderIn('sv', ['Pistoolirata', null, null]);
    expect(screen.getByText('Pistoolirata')).toBeInTheDocument();
  });

  it('shows Finnish in Finnish, whatever the translations say', () => {
    renderIn('fi', ['Pistoolirata', 'Pistolbana', 'Pistol range']);
    expect(screen.getByText('Pistoolirata')).toBeInTheDocument();
  });
});
