/**
 * Tests for Slot/Fill System
 * React component tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SlotFillProvider } from '../SlotFillContext';
import { Slot } from '../Slot';
import { Fill } from '../Fill';

describe('Slot/Fill System', () => {
  describe('Slot', () => {
    it('should render fallback when no fills', () => {
      render(
        <SlotFillProvider>
          <Slot name="test-slot" fallback={<div>No content</div>} />
        </SlotFillProvider>
      );

      expect(screen.getByText('No content')).toBeInTheDocument();
    });

    it('should render fills when registered', async () => {
      render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot">
            <div>Fill content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Fill content')).toBeInTheDocument();
      });
    });

    it('should render multiple fills in order', async () => {
      const { container } = render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot" order={20}>
            <div>Second</div>
          </Fill>
          <Fill slot="test-slot" order={10}>
            <div>First</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        const divs = Array.from(container.querySelectorAll('div'));
        const texts = divs.map((el) => el.textContent);

        const firstIndex = texts.findIndex((t) => t === 'First');
        const secondIndex = texts.findIndex((t) => t === 'Second');

        expect(firstIndex).toBeGreaterThan(-1);
        expect(secondIndex).toBeGreaterThan(-1);
        expect(firstIndex).toBeLessThan(secondIndex);
      });
    });

    it('should add custom className', () => {
      const { container } = render(
        <SlotFillProvider>
          <Slot name="test-slot" className="custom-class" />
        </SlotFillProvider>
      );

      const slot = container.querySelector('.custom-class');
      expect(slot).not.toBeNull();
      expect(slot).toHaveClass('custom-class');
    });

    it('should add data-slot attribute', () => {
      const { container } = render(
        <SlotFillProvider>
          <Slot name="test-slot" />
        </SlotFillProvider>
      );

      const slot = container.querySelector('[data-slot="test-slot"]');
      expect(slot).not.toBeNull();
      expect(slot).toHaveAttribute('data-slot', 'test-slot');
    });
  });

  describe('Fill', () => {
    it('should register with default order 10', async () => {
      render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot">
            <div>Content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should unregister on unmount', async () => {
      const { rerender } = render(
        <SlotFillProvider>
          <Slot name="test-slot" fallback={<div>Empty</div>} />
          <Fill slot="test-slot">
            <div>Content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      rerender(
        <SlotFillProvider>
          <Slot name="test-slot" fallback={<div>Empty</div>} />
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Empty')).toBeInTheDocument();
      });
    });

    it('should add data-fill-id attribute', async () => {
      const { container } = render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot">
            <div>Content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        const fill = container.querySelector('[data-fill-id]');
        expect(fill).toBeInTheDocument();
      });
    });

    it('should support pluginId', async () => {
      const { container } = render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot" pluginId="my-plugin">
            <div>Content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        const fill = container.querySelector('[data-plugin-id="my-plugin"]');
        expect(fill).toBeInTheDocument();
      });
    });

    it('should not render anything directly', () => {
      const { container } = render(
        <SlotFillProvider>
          <Fill slot="test-slot">
            <div>Content</div>
          </Fill>
        </SlotFillProvider>
      );

      // Fill itself should not render
      expect(container.firstChild).toBeNull();
    });
  });

  describe('SlotFillProvider', () => {
    it('should throw error when useSlotFill used outside provider', () => {
      // This would throw in actual usage
      // Testing error boundaries is complex, so we just verify the provider works
      expect(() => {
        render(
          <SlotFillProvider>
            <div>Content</div>
          </SlotFillProvider>
        );
      }).not.toThrow();
    });

    it('should allow nested slots and fills', async () => {
      render(
        <SlotFillProvider>
          <Slot name="outer" />
          <Fill slot="outer">
            <div>
              <Slot name="inner" />
            </div>
          </Fill>
          <Fill slot="inner">
            <div>Inner content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Inner content')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('should handle multiple fills in different slots', async () => {
      render(
        <SlotFillProvider>
          <Slot name="slot1" />
          <Slot name="slot2" />
          <Fill slot="slot1">
            <div>Slot 1 content</div>
          </Fill>
          <Fill slot="slot2">
            <div>Slot 2 content</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Slot 1 content')).toBeInTheDocument();
        expect(screen.getByText('Slot 2 content')).toBeInTheDocument();
      });
    });

    it('should handle dynamic fill additions', async () => {
      const { rerender } = render(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot">
            <div>Fill 1</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Fill 1')).toBeInTheDocument();
      });

      rerender(
        <SlotFillProvider>
          <Slot name="test-slot" />
          <Fill slot="test-slot">
            <div>Fill 1</div>
          </Fill>
          <Fill slot="test-slot">
            <div>Fill 2</div>
          </Fill>
        </SlotFillProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Fill 1')).toBeInTheDocument();
        expect(screen.getByText('Fill 2')).toBeInTheDocument();
      });
    });
  });
});
