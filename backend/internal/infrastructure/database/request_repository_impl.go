package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
)

type dateRequestRepository struct {
	db *PostgresDB
}

// NewDateRequestRepository creates a new date request repository
func NewDateRequestRepository(db *PostgresDB) repository.DateRequestRepository {
	return &dateRequestRepository{db: db}
}

func (r *dateRequestRepository) FindAll(ctx context.Context) ([]*entity.DateRequest, error) {
	query := `SELECT id, user_id, request_type, title, description, location, status, created_at, updated_at 
			  FROM date_requests ORDER BY created_at DESC`

	rows, err := r.db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entity.DateRequest
	for rows.Next() {
		req := &entity.DateRequest{}
		err := rows.Scan(&req.ID, &req.UserID, &req.RequestType, &req.Title, &req.Description,
			&req.Location, &req.Status, &req.CreatedAt, &req.UpdatedAt)
		if err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}

	return requests, nil
}

func (r *dateRequestRepository) FindByID(ctx context.Context, id int64) (*entity.DateRequest, error) {
	query := `SELECT id, user_id, request_type, title, description, location, status, created_at, updated_at 
			  FROM date_requests WHERE id = $1`

	req := &entity.DateRequest{}
	err := r.db.DB.QueryRowContext(ctx, query, id).Scan(
		&req.ID, &req.UserID, &req.RequestType, &req.Title, &req.Description,
		&req.Location, &req.Status, &req.CreatedAt, &req.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("request not found")
	}
	if err != nil {
		return nil, err
	}

	return req, nil
}

func (r *dateRequestRepository) FindByUserID(ctx context.Context, userID int64) ([]*entity.DateRequest, error) {
	query := `SELECT id, user_id, request_type, title, description, location, status, created_at, updated_at 
			  FROM date_requests WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []*entity.DateRequest
	for rows.Next() {
		req := &entity.DateRequest{}
		err := rows.Scan(&req.ID, &req.UserID, &req.RequestType, &req.Title, &req.Description,
			&req.Location, &req.Status, &req.CreatedAt, &req.UpdatedAt)
		if err != nil {
			return nil, err
		}
		requests = append(requests, req)
	}

	return requests, nil
}

func (r *dateRequestRepository) Create(ctx context.Context, request *entity.DateRequest) error {
	query := `INSERT INTO date_requests (user_id, request_type, title, description, location, status, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`

	err := r.db.DB.QueryRowContext(ctx, query,
		request.UserID, request.RequestType, request.Title, request.Description,
		request.Location, request.Status,
	).Scan(&request.ID)

	return err
}

func (r *dateRequestRepository) UpdateStatus(ctx context.Context, id int64, status entity.RequestStatus) error {
	query := `UPDATE date_requests SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.DB.ExecContext(ctx, query, status, id)
	return err
}

func (r *dateRequestRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM date_requests WHERE id = $1`
	_, err := r.db.DB.ExecContext(ctx, query, id)
	return err
}
