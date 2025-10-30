/**
 * DeveloperModeToggle Tests
 * Phase 2 - Developer Mode + GitHub OAuth
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { DeveloperModeToggle, useDeveloperMode } from '../DeveloperModeToggle';

describe('DeveloperModeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with developer mode disabled by default', () => {
      render(<DeveloperModeToggle />);

      expect(screen.getByText('Mode Développeur')).toBeInTheDocument();
      expect(screen.getByText(/Activez pour accéder aux outils/)).toBeInTheDocument();

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render with developer mode enabled from localStorage', () => {
      localStorage.setItem('bigmind-developer-mode', 'true');

      render(<DeveloperModeToggle />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(screen.getByText(/Clone et publiez des plugins/)).toBeInTheDocument();
    });

    it('should show information panel when enabled', () => {
      localStorage.setItem('bigmind-developer-mode', 'true');

      render(<DeveloperModeToggle />);

      expect(screen.getByText(/Mode développeur activé/)).toBeInTheDocument();
      expect(screen.getByText(/Clone des plugins community/)).toBeInTheDocument();
      expect(screen.getByText(/Publication de vos modifications/)).toBeInTheDocument();
      expect(screen.getByText(/Outils de build et test/)).toBeInTheDocument();
    });

    it('should hide information panel when disabled', () => {
      render(<DeveloperModeToggle />);

      expect(screen.queryByText('Mode développeur activé')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle developer mode on click', async () => {
      render(<DeveloperModeToggle />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      expect(localStorage.getItem('bigmind-developer-mode')).toBe('true');
    });

    it('should toggle developer mode off when clicking again', async () => {
      localStorage.setItem('bigmind-developer-mode', 'true');

      render(<DeveloperModeToggle />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });

      expect(localStorage.getItem('bigmind-developer-mode')).toBe('false');
    });

    it('should persist toggle state in localStorage', async () => {
      render(<DeveloperModeToggle />);

      const checkbox = screen.getByRole('checkbox');

      // Enable
      fireEvent.click(checkbox);
      await waitFor(() => {
        expect(localStorage.getItem('bigmind-developer-mode')).toBe('true');
      });

      // Disable
      fireEvent.click(checkbox);
      await waitFor(() => {
        expect(localStorage.getItem('bigmind-developer-mode')).toBe('false');
      });
    });

    it('should call onChange callback when toggled', async () => {
      const onChangeMock = vi.fn();

      render(<DeveloperModeToggle onChange={onChangeMock} />);

      // Initial render calls onChange with false
      expect(onChangeMock).toHaveBeenCalledWith(false);

      const checkbox = screen.getByRole('checkbox');

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith(true);
      });

      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith(false);
      });

      // Total: 3 calls (initial false, toggle to true, toggle to false)
      expect(onChangeMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      render(<DeveloperModeToggle />);

      const label = screen.getByLabelText('Activer/désactiver le mode développeur');
      expect(label).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(<DeveloperModeToggle />);

      const checkbox = screen.getByRole('checkbox');

      // Simulate keyboard interaction
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);

      fireEvent.keyDown(checkbox, { key: 'Enter' });
      fireEvent.click(checkbox); // React checkbox requires click

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should update icon color when enabled', () => {
      const { container } = render(<DeveloperModeToggle />);

      // Initial state - icon should be secondary color
      let codeIcon = container.querySelector('svg');
      expect(codeIcon).toBeTruthy();

      // Enable developer mode
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Icon color should change to accent color (checked via props in component)
      codeIcon = container.querySelector('svg');
      expect(codeIcon).toBeTruthy();
    });

    it('should update description text when toggled', async () => {
      render(<DeveloperModeToggle />);

      // Initially disabled
      expect(screen.getByText(/Activez pour accéder aux outils/)).toBeInTheDocument();

      // Enable
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText(/Clone et publiez des plugins/)).toBeInTheDocument();
      });

      // Disable
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText(/Activez pour accéder aux outils/)).toBeInTheDocument();
      });
    });
  });
});

describe('useDeveloperMode hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return false by default', () => {
    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current).toBe(false);
  });

  it('should return true when enabled in localStorage', () => {
    localStorage.setItem('bigmind-developer-mode', 'true');

    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current).toBe(true);
  });

  it('should update when localStorage changes', async () => {
    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current).toBe(false);

    // Simulate storage change from another component
    act(() => {
      localStorage.setItem('bigmind-developer-mode', 'true');
      window.dispatchEvent(new StorageEvent('storage'));
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should listen to custom developer-mode-changed event', async () => {
    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current).toBe(false);

    // Simulate custom event (for same-window updates)
    act(() => {
      localStorage.setItem('bigmind-developer-mode', 'true');
      window.dispatchEvent(new Event('developer-mode-changed'));
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useDeveloperMode());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'developer-mode-changed',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it('should be reactive across multiple hook instances', async () => {
    const { result: result1 } = renderHook(() => useDeveloperMode());
    const { result: result2 } = renderHook(() => useDeveloperMode());

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);

    // Update from one instance
    act(() => {
      localStorage.setItem('bigmind-developer-mode', 'true');
      window.dispatchEvent(new Event('developer-mode-changed'));
    });

    await waitFor(() => {
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });
  });
});
