import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const GET_RECIPES = gql`
  query GetRecipes($limit: Int!, $offset: Int!) {
    recipes(limit: $limit, offset: $offset) {
      id
      name
      description
      ingredients
      instructions
    }
  }
`;

const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      id
    }
  }
`;

const ADD_RECIPE = gql`
  mutation AddRecipe($input: AddRecipeInput!) {
    addRecipe(input: $input) {
      id
      name
      description
      ingredients
      instructions
    }
  }
`;

const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($id: ID!, $input: UpdateRecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      id
      name
      description
      ingredients
      instructions
    }
  }
`;

function RecipeList() {
  const [currentPage, setCurrentPage] = useState(0);
  const recipesPerPage = 5;

  const { loading, error, data, refetch } = useQuery(GET_RECIPES, {
    variables: { limit: recipesPerPage, offset: currentPage * recipesPerPage },
  });

  const [deleteRecipe] = useMutation(DELETE_RECIPE, {
    update(cache, { data: { deleteRecipe } }) {
      cache.modify({
        fields: {
          recipes(existingRecipes = []) {
            return existingRecipes.filter(recipe => recipe.__ref !== `Recipe:${deleteRecipe.id}`);
          }
        }
      });
    },
    onCompleted: () => refetch(),
  });

  const [addRecipe] = useMutation(ADD_RECIPE, {
    update(cache, { data: { addRecipe } }) {
      cache.modify({
        fields: {
          recipes(existingRecipes = []) {
            const newRecipeRef = cache.writeFragment({
              data: addRecipe,
              fragment: gql`
                fragment NewRecipe on Recipe {
                  id
                  name
                  description
                  ingredients
                  instructions
                }
              `
            });
            return [...existingRecipes, newRecipeRef];
          }
        }
      });
    },
    onCompleted: () => refetch(),
  });

  const [updateRecipe] = useMutation(UPDATE_RECIPE, {
    onCompleted: () => refetch(),
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    ingredients: '',
    instructions: ''
  });

  if (loading) return <Typography variant="h6">Loading...</Typography>;
  if (error) return <Typography variant="h6">Error: {error.message}</Typography>;

  const handleDelete = (id) => {
    deleteRecipe({ variables: { id } });
  };

  const handleEdit = (recipe) => {
    setDialogType('Edit');
    setSelectedRecipe(recipe);
    setFormState({
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions.join('\n')
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setDialogType('Add');
    setFormState({
      name: '',
      description: '',
      ingredients: '',
      instructions: ''
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedRecipe(null);
    setFormState({
      name: '',
      description: '',
      ingredients: '',
      instructions: ''
    });
  };

  const handleDialogSubmit = () => {
    const input = {
      name: formState.name,
      description: formState.description,
      ingredients: formState.ingredients.split('\n'),
      instructions: formState.instructions.split('\n')
    };

    if (dialogType === 'Add') {
      addRecipe({ variables: { input } });
    } else if (dialogType === 'Edit') {
      updateRecipe({ variables: { id: selectedRecipe.id, input } });
    }

    handleDialogClose();
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Recipes App
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ marginBottom: 2 }}
      >
        Add Recipe
      </Button>
      {data.recipes.map((recipe) => (
        <Paper key={recipe.id} elevation={3} sx={{ marginBottom: 4, padding: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h2" gutterBottom>
              {recipe.name}
            </Typography>
            <Box>
              <IconButton color="primary" onClick={() => handleEdit(recipe)}>
                <EditIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDelete(recipe.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body1" paragraph>
            <strong>Description:</strong> {recipe.description}
          </Typography>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="body1">
            <strong>Ingredients:</strong>
          </Typography>
          <List disablePadding>
            {recipe.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText primary={ingredient} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="body1">
            <strong>Instructions:</strong>
          </Typography>
          <List disablePadding>
            {recipe.instructions.map((instruction, index) => (
              <ListItem key={index}>
                <ListItemText primary={instruction} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          variant="contained"
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleNextPage}
          disabled={data.recipes.length < recipesPerPage}
        >
          Next
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{dialogType === 'Add' ? 'Add Recipe' : 'Edit Recipe'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={formState.name}
            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Ingredients (one per line)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formState.ingredients}
            onChange={(e) => setFormState({ ...formState, ingredients: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Instructions (one per line)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formState.instructions}
            onChange={(e) => setFormState({ ...formState, instructions: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDialogSubmit} color="primary">
            {dialogType === 'Add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RecipeList;
