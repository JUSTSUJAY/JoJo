"""
Neural Network that will predict the rewards and policies for the agent on which we will reinforce our agent to make better choices
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class LinearNetwork(nn.Module):
    def __init__(self,input_shape,action_space,first_layer_size = 512,second_layer_size = 256):
        super().__init__()
        self.first_layer = nn.Linear(input_shape[0],first_layer_size)
        self.second_layer = nn.Linear(first_layer_size,second_layer_size)
        self.value_head = nn.Linear(second_layer_size,1)
        self.policy_head = nn.Linear(second_layer_size,action_space)

        self.device = torch.device('cuda'if torch.cuda.is_available() else 'cpu')
        self.to(self.device)

    def __call__(self,observations):
        self.train() # set to training mode to forward pass 
        x = F.relu(self.first_layer(observations));
        x = F.relu(self.second_layer(x))
        value_win_prob = F.tanh(self.value_head(x))
        policy_logits = F.log_softmax(self.policy_head(x),dim = -1)
        return value_win_prob,policy_logits

    def value_forward(self,observation):
        self.eval()
        with torch.no_grad():
            x = F.relu(self.first_layer(observation))
            x = F.relu(self.second_layer(x))
            value_win_prob = F.tanh(self.value_head(x))
            return value_win_prob
    
    def policy_forward(self,observation):
        self.eval()
        with torch.no_grad():
            x = F.relu(self.first_layer(observation))
            x = F.relu(self.second_layer(x))
            policy_logits = F.softmax(self.policy_head(x),dim = -1)
            return policy_logits