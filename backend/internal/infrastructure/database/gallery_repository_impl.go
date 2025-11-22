package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
)

type galleryRepository struct {
	db *PostgresDB
}

// NewGalleryRepository creates a new gallery repository
func NewGalleryRepository(db *PostgresDB) repository.GalleryRepository {
	return &galleryRepository{db: db}
}

func (r *galleryRepository) FindAll(ctx context.Context) ([]*entity.Gallery, error) {
	query := `SELECT id, user_id, file_type, file_path, caption, created_at, updated_at 
			  FROM gallery ORDER BY created_at DESC`

	rows, err := r.db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var galleries []*entity.Gallery
	for rows.Next() {
		g := &entity.Gallery{}
		err := rows.Scan(&g.ID, &g.UserID, &g.FileType, &g.FilePath, &g.Caption, &g.CreatedAt, &g.UpdatedAt)
		if err != nil {
			return nil, err
		}
		galleries = append(galleries, g)
	}

	return galleries, nil
}

func (r *galleryRepository) FindByID(ctx context.Context, id int64) (*entity.Gallery, error) {
	query := `SELECT id, user_id, file_type, file_path, caption, created_at, updated_at 
			  FROM gallery WHERE id = $1`

	g := &entity.Gallery{}
	err := r.db.DB.QueryRowContext(ctx, query, id).Scan(
		&g.ID, &g.UserID, &g.FileType, &g.FilePath, &g.Caption, &g.CreatedAt, &g.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("gallery item not found")
	}
	if err != nil {
		return nil, err
	}

	return g, nil
}

func (r *galleryRepository) FindByUserID(ctx context.Context, userID int64) ([]*entity.Gallery, error) {
	query := `SELECT id, user_id, file_type, file_path, caption, created_at, updated_at 
			  FROM gallery WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var galleries []*entity.Gallery
	for rows.Next() {
		g := &entity.Gallery{}
		err := rows.Scan(&g.ID, &g.UserID, &g.FileType, &g.FilePath, &g.Caption, &g.CreatedAt, &g.UpdatedAt)
		if err != nil {
			return nil, err
		}
		galleries = append(galleries, g)
	}

	return galleries, nil
}

func (r *galleryRepository) Create(ctx context.Context, gallery *entity.Gallery) error {
	query := `INSERT INTO gallery (user_id, file_type, file_path, caption, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`

	err := r.db.DB.QueryRowContext(ctx, query,
		gallery.UserID, gallery.FileType, gallery.FilePath, gallery.Caption,
	).Scan(&gallery.ID)

	return err
}

func (r *galleryRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM gallery WHERE id = $1`
	_, err := r.db.DB.ExecContext(ctx, query, id)
	return err
}
