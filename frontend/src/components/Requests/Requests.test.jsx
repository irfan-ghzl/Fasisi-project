import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Requests from '../components/Requests/Requests';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Requests Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock.jwt.token');
  });

  it('renders requests page', () => {
    renderWithRouter(<Requests />);
    
    expect(screen.getByText(/Request Kencan/i)).toBeInTheDocument();
    expect(screen.getByText(/Buat Request/i)).toBeInTheDocument();
  });

  it('opens modal when create button is clicked', async () => {
    renderWithRouter(<Requests />);
    
    const createButton = screen.getByText(/Buat Request/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Tipe Request/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Judul/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Deskripsi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Lokasi/i)).toBeInTheDocument();
    });
  });

  it('submits new request successfully', async () => {
    const axios = await import('axios');
    axios.default.post.mockResolvedValue({
      data: {
        id: 1,
        request_type: 'food',
        title: 'Makan di Restoran Italia',
        description: 'Aku mau coba pasta carbonara',
        location: 'Restoran Bella Italia',
        status: 'pending',
      },
    });

    renderWithRouter(<Requests />);
    
    // Open modal
    const createButton = screen.getByText(/Buat Request/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      const typeSelect = screen.getByLabelText(/Tipe Request/i);
      const titleInput = screen.getByLabelText(/Judul/i);
      const descInput = screen.getByLabelText(/Deskripsi/i);
      const locationInput = screen.getByLabelText(/Lokasi/i);
      const submitButton = screen.getByRole('button', { name: /Buat/i });

      fireEvent.change(typeSelect, { target: { value: 'food' } });
      fireEvent.change(titleInput, { target: { value: 'Makan di Restoran Italia' } });
      fireEvent.change(descInput, { target: { value: 'Aku mau coba pasta carbonara' } });
      fireEvent.change(locationInput, { target: { value: 'Restoran Bella Italia' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        '/api/requests',
        expect.objectContaining({
          request_type: 'food',
          title: 'Makan di Restoran Italia',
        }),
        expect.any(Object)
      );
    });
  });

  it('displays request list', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({
      data: [
        {
          id: 1,
          request_type: 'food',
          title: 'Makan di Restoran Italia',
          description: 'Pasta carbonara',
          location: 'Bella Italia',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    });

    renderWithRouter(<Requests />);

    await waitFor(() => {
      expect(screen.getByText(/Makan di Restoran Italia/i)).toBeInTheDocument();
      expect(screen.getByText(/Pasta carbonara/i)).toBeInTheDocument();
      expect(screen.getByText(/Bella Italia/i)).toBeInTheDocument();
    });
  });

  it('allows super admin to delete request', async () => {
    const axios = await import('axios');
    localStorage.setItem('userRole', 'super_admin');
    
    axios.default.get.mockResolvedValue({
      data: [{
        id: 1,
        request_type: 'food',
        title: 'Test Request',
        status: 'pending',
      }],
    });
    axios.default.delete.mockResolvedValue({ data: { success: true } });

    renderWithRouter(<Requests />);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /Hapus/i });
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(axios.default.delete).toHaveBeenCalledWith(
        '/api/requests/1',
        expect.any(Object)
      );
    });
  });
});
