import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../components/Chat/Chat';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock.jwt.token');
    localStorage.setItem('userId', '1');
  });

  it('renders chat interface', () => {
    renderWithRouter(<Chat />);
    
    expect(screen.getByText(/Chat/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ketik pesan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim/i })).toBeInTheDocument();
  });

  it('displays chat messages', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({
      data: [
        {
          id: 1,
          sender_id: 1,
          receiver_id: 2,
          message: 'Halo sayang!',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          sender_id: 2,
          receiver_id: 1,
          message: 'Halo juga!',
          created_at: '2024-01-01T00:01:00Z',
        },
      ],
    });

    renderWithRouter(<Chat />);

    await waitFor(() => {
      expect(screen.getByText(/Halo sayang!/i)).toBeInTheDocument();
      expect(screen.getByText(/Halo juga!/i)).toBeInTheDocument();
    });
  });

  it('sends new message', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({ data: [] });
    axios.default.post.mockResolvedValue({
      data: {
        id: 3,
        message: 'Test message',
        created_at: '2024-01-01T00:02:00Z',
      },
    });

    renderWithRouter(<Chat />);

    const messageInput = screen.getByPlaceholderText(/Ketik pesan/i);
    const sendButton = screen.getByRole('button', { name: /Kirim/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        '/api/chat/messages',
        { message: 'Test message' },
        expect.any(Object)
      );
    });
  });

  it('prevents sending empty message', () => {
    renderWithRouter(<Chat />);

    const messageInput = screen.getByPlaceholderText(/Ketik pesan/i);
    const sendButton = screen.getByRole('button', { name: /Kirim/i });

    fireEvent.click(sendButton);

    expect(messageInput.value).toBe('');
  });

  it('clears input after sending message', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({ data: [] });
    axios.default.post.mockResolvedValue({
      data: { id: 1, message: 'Test' },
    });

    renderWithRouter(<Chat />);

    const messageInput = screen.getByPlaceholderText(/Ketik pesan/i);
    const sendButton = screen.getByRole('button', { name: /Kirim/i });

    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(messageInput.value).toBe('');
    });
  });
});
