import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TicketProvider } from '../context/TicketContext';

interface AllProvidersProps { children: React.ReactNode }

function AllProviders({ children }: AllProvidersProps) {
	return React.createElement(
		MemoryRouter,
		null,
		React.createElement(TicketProvider, null, children)
	);
}

const customRender = (
	ui: React.ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
