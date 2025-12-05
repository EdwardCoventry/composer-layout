import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryPanel } from './HistoryPanel';

const sampleItems = [
	{
		id: '1',
		title: 'First conversation',
		timestamp: '10:00 AM',
		typeLabel: 'Chat',
		groupLabel: 'Today',
		prompt: 'Hello',
	},
	{
		id: '2',
		title: 'Second conversation with a longer title',
		timestamp: '11:20 AM',
		typeLabel: 'Image',
		groupLabel: 'Today',
		prompt: 'Generate image',
	},
];

describe('HistoryPanel', () => {
	it('renders nothing when closed', () => {
		const { container } = render(
			<HistoryPanel
				open={false}
				items={[]}
				onClose={() => {}}
				onSelect={() => {}}
			/>
		);
		expect(container.firstChild).toBeFalsy();
	});

	it('renders header and content when open', () => {
		render(
			<HistoryPanel
				open={true}
				items={sampleItems}
				onClose={() => {}}
				onSelect={() => {}}
			/>
		);

		const dialog = screen.getByRole('dialog', { name: /history/i });
		expect(!!dialog).toBe(true);
		const title = screen.getByText(/history/i);
		expect(!!title).toBe(true);

		const closeButtons = screen.getAllByRole('button', { name: /close/i });
		expect(closeButtons.length).toBeGreaterThanOrEqual(1);

		const rowButton = screen.getByText(/first conversation/i).closest('button');
		expect(!!rowButton).toBe(true);
	});

	it('fires onClose when backdrop is clicked', () => {
		const onClose = vi.fn();
		render(
			<HistoryPanel
				open={true}
				items={sampleItems}
				onClose={onClose}
				onSelect={() => {}}
			/>
		);
		// There are two close buttons: backdrop and header icon. We want the backdrop.
		const backdrop = screen.getByRole('button', { name: /^close$/i });
		fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalled();
	});

	it('fires onSelect when a history row is clicked', () => {
		const onSelect = vi.fn();
		render(
			<HistoryPanel
				open={true}
				items={sampleItems}
				onClose={() => {}}
				onSelect={onSelect}
			/>
		);

		const row = screen.getByText(/first conversation/i).closest('button');
		if (row) {
			fireEvent.click(row);
		}
		expect(onSelect).toHaveBeenCalled();
	});
});
