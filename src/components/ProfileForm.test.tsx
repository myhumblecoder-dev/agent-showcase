import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProfileForm } from './ProfileForm';

describe('ProfileForm', () => {
  it('renders form fields pre-filled with initial values', () => {
    render(
      <ProfileForm
        action={vi.fn()}
        initialValues={{
          displayName: 'Ada',
          bio: 'builds things',
          framework: 'Next.js',
          tags: 'ai,web',
          githubUrl: 'https://github.com/ada',
          websiteUrl: '',
        }}
      />
    );

    expect(screen.getByLabelText(/display name/i)).toHaveValue('Ada');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('builds things');
    expect(screen.getByLabelText(/framework/i)).toHaveValue('Next.js');
    expect(screen.getByLabelText(/tags/i)).toHaveValue('ai,web');
    expect(screen.getByLabelText(/github url/i)).toHaveValue('https://github.com/ada');
    expect(screen.getByLabelText(/website url/i)).toHaveValue('');
  });

  it('calls action prop with parsed tag array on submit', async () => {
    const mockAction = vi.fn().mockResolvedValue({ ok: true });
    const user = userEvent.setup();

    render(
      <ProfileForm
        action={mockAction}
        initialValues={{
          displayName: '',
          bio: '',
          framework: '',
          tags: '',
          githubUrl: '',
          websiteUrl: '',
        }}
      />
    );

    const displayNameInput = screen.getByLabelText(/display name/i);
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Bob');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(mockAction).toHaveBeenCalledOnce();
    const callArg = mockAction.mock.calls[0][0];
    expect(callArg).toEqual({
      displayName: 'Bob',
      bio: '',
      framework: '',
      tags: [],
      githubUrl: '',
      websiteUrl: '',
    });
    expect(callArg.tags).toEqual([]);
  });

  it('displays error message when action returns error', async () => {
    const mockAction = vi.fn().mockResolvedValue({ ok: false, error: 'Failed to save' });
    const user = userEvent.setup();

    render(
      <ProfileForm
        action={mockAction}
        initialValues={{
          displayName: 'Charlie',
          bio: '',
          framework: '',
          tags: '',
          githubUrl: '',
          websiteUrl: '',
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });
});
