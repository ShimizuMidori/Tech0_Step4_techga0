"""Add manager comment and likes to Post

Revision ID: 1b8de4869896
Revises: 1efa9f6bdd0f
Create Date: 2024-04-07 15:01:15.549112

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1b8de4869896'
down_revision = '1efa9f6bdd0f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('manager_comment', sa.String(length=300), nullable=True))
        batch_op.add_column(sa.Column('likes', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('post', schema=None) as batch_op:
        batch_op.drop_column('likes')
        batch_op.drop_column('manager_comment')

    # ### end Alembic commands ###