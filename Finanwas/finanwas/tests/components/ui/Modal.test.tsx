import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('should render modal when open is true', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title="Test Modal"
        description="Test description"
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render modal when open is false', () => {
    render(
      <Modal
        open={false}
        onOpenChange={vi.fn()}
        title="Test Modal"
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title="Test Modal"
        footer={
          <button>Confirm</button>
        }
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('should render without title and description', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
      >
        <p>Just content</p>
      </Modal>
    );

    expect(screen.getByText('Just content')).toBeInTheDocument();
  });

  it('should render with React node as title', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title={<span data-testid="custom-title">Custom Title</span>}
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
  });

  it('should handle different max width sizes', () => {
    const { container } = render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        maxWidth="sm"
      >
        <p>Small modal</p>
      </Modal>
    );

    // Check if the max-width class is applied
    const dialogContent = container.querySelector('[role="dialog"]');
    expect(dialogContent).toHaveClass('sm:max-w-sm');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        className="custom-modal-class"
      >
        <p>Modal content</p>
      </Modal>
    );

    const dialogContent = container.querySelector('[role="dialog"]');
    expect(dialogContent).toHaveClass('custom-modal-class');
  });

  it('should render children correctly', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
      >
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Modal>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should support complex footer with multiple buttons', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        footer={
          <>
            <button>Cancel</button>
            <button>Save</button>
            <button>Delete</button>
          </>
        }
      >
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
